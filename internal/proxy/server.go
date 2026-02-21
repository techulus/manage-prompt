package proxy

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/techulus/manage-prompt/internal/api"
	"github.com/techulus/manage-prompt/internal/storage"
	"github.com/techulus/manage-prompt/internal/ws"
	"github.com/techulus/manage-prompt/web"
)

type Server struct {
	db   *storage.DB
	port int
}

func NewServer(db *storage.DB, port int) *Server {
	return &Server{db: db, port: port}
}

func (s *Server) Start() error {
	hub := ws.NewHub()
	apiHandlers := api.NewHandlers(s.db, hub)
	proxyHandler := NewProxyHandler(s.db, hub)
	webHandler := web.NewHandler(s.db)

	mux := http.NewServeMux()

	mux.HandleFunc("/ui", webHandler.Index)
	mux.HandleFunc("/ui/", webHandler.ServeUI)
	mux.Handle("/static/", http.FileServer(http.FS(web.StaticFS())))

	mux.HandleFunc("/api/ws", hub.HandleWS)
	mux.HandleFunc("/api/stats", apiHandlers.GetStats)
	mux.HandleFunc("/api/requests", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			apiHandlers.ListRequests(w, r)
		case http.MethodDelete:
			apiHandlers.DeleteRequests(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/api/requests/", func(w http.ResponseWriter, r *http.Request) {
		apiHandlers.GetRequest(w, r)
	})
	mux.HandleFunc("/api/ingest", apiHandlers.Ingest)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" && r.Header.Get(TargetHeader) == "" {
			http.Redirect(w, r, "/ui", http.StatusTemporaryRedirect)
			return
		}
		proxyHandler.ServeHTTP(w, r)
	})

	addr := fmt.Sprintf(":%d", s.port)
	srv := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	fmt.Printf("\n  ManagePrompt is running!\n\n")
	fmt.Printf("  Proxy:  http://localhost:%d\n", s.port)
	fmt.Printf("  UI:     http://localhost:%d/ui\n\n", s.port)

	go openBrowser(fmt.Sprintf("http://localhost:%d/ui", s.port))

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "server error: %v\n", err)
			os.Exit(1)
		}
	}()

	<-stop
	fmt.Println("\nShutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return srv.Shutdown(ctx)
}

func openBrowser(url string) {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "darwin":
		cmd = "open"
	case "linux":
		cmd = "xdg-open"
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start"}
	default:
		return
	}

	args = append(args, url)
	_ = exec.Command(cmd, args...).Start()
}

