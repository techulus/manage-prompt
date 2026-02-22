package web

import (
	"html/template"
	"log"
	"net/http"
	"strings"

	"github.com/techulus/manage-prompt/internal/storage"
)

type Handler struct {
	db        *storage.DB
	version   string
	templates *template.Template
}

func NewHandler(db *storage.DB, version string) *Handler {
	funcs := template.FuncMap{
		"deref": func(v any) any {
			switch p := v.(type) {
			case *int:
				if p != nil {
					return *p
				}
			case *float64:
				if p != nil {
					return *p
				}
			case *string:
				if p != nil {
					return *p
				}
			}
			return nil
		},
	}
	tmpl := template.Must(template.New("").Funcs(funcs).ParseFS(TemplateFS(), "*.html"))
	return &Handler{db: db, version: version, templates: tmpl}
}

func (h *Handler) Index(w http.ResponseWriter, r *http.Request) {
	if err := h.templates.ExecuteTemplate(w, "index.html", nil); err != nil {
		log.Printf("template error: %v", err)
	}
}

func (h *Handler) Settings(w http.ResponseWriter, r *http.Request) {
	if err := h.templates.ExecuteTemplate(w, "settings.html", map[string]string{
		"Version": h.version,
	}); err != nil {
		log.Printf("template error: %v", err)
	}
}

func (h *Handler) ServeUI(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/ui/")

	if strings.HasPrefix(path, "requests/") {
		id := strings.TrimPrefix(path, "requests/")
		req, err := h.db.Get(id)
		if err != nil {
			http.Error(w, "Request not found", http.StatusNotFound)
			return
		}
		if err := h.templates.ExecuteTemplate(w, "detail.html", req); err != nil {
			log.Printf("template error: %v", err)
		}
		return
	}

	h.Index(w, r)
}
