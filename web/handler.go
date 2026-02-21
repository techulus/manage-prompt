package web

import (
	"html/template"
	"net/http"
	"strings"

	"github.com/techulus/manage-prompt/internal/storage"
)

type Handler struct {
	db        *storage.DB
	templates *template.Template
}

func NewHandler(db *storage.DB) *Handler {
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
	return &Handler{db: db, templates: tmpl}
}

func (h *Handler) Index(w http.ResponseWriter, r *http.Request) {
	h.templates.ExecuteTemplate(w, "index.html", nil)
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
		h.templates.ExecuteTemplate(w, "detail.html", req)
		return
	}

	h.Index(w, r)
}
