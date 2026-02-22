package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/techulus/manage-prompt/internal/server"
	"github.com/techulus/manage-prompt/internal/storage"
)

var version = "dev"

func main() {
	rootCmd := &cobra.Command{
		Use:   "manageprompt",
		Short: "Local LLM call debugger",
	}

	var port int

	startCmd := &cobra.Command{
		Use:   "start",
		Short: "Start the server",
		RunE: func(cmd *cobra.Command, args []string) error {
			db, err := storage.Open("")
			if err != nil {
				return fmt.Errorf("failed to open database: %w", err)
			}
			defer db.Close()

			srv := server.NewServer(db, port, version)
			return srv.Start()
		},
	}
	startCmd.Flags().IntVarP(&port, "port", "p", 54321, "port to listen on")

	clearCmd := &cobra.Command{
		Use:   "clear",
		Short: "Clear all stored requests",
		RunE: func(cmd *cobra.Command, args []string) error {
			db, err := storage.Open("")
			if err != nil {
				return fmt.Errorf("failed to open database: %w", err)
			}
			defer db.Close()

			count, err := db.ClearAll()
			if err != nil {
				return fmt.Errorf("failed to clear requests: %w", err)
			}
			fmt.Printf("Cleared %d requests.\n", count)
			return nil
		},
	}

	versionCmd := &cobra.Command{
		Use:   "version",
		Short: "Print version",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Printf("manageprompt %s\n", version)
		},
	}

	rootCmd.AddCommand(startCmd, clearCmd, versionCmd)

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}
