package web

import (
	"embed"
	"io/fs"
)

//go:embed templates static
var embeddedFS embed.FS

func StaticFS() fs.FS {
	sub, _ := fs.Sub(embeddedFS, ".")
	return sub
}

func TemplateFS() fs.FS {
	sub, _ := fs.Sub(embeddedFS, "templates")
	return sub
}
