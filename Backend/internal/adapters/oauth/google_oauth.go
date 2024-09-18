package oauth

import (
	"fmt"
	"os"
	"paperGrader/internal/config"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type Config struct {
	GoogleLoginConfig oauth2.Config
}

var AppConfig Config

func InitializeGoogleOAuth() oauth2.Config {
	config.LoadEnv()
	userInfoEmail := os.Getenv("USERINFO_EMAIL")
	userInfoProfile := os.Getenv("USERINFO_PROFILE")

	scopeList := []string{userInfoEmail, userInfoProfile}

	AppConfig.GoogleLoginConfig = oauth2.Config{
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		Scopes:       scopeList,
		Endpoint:     google.Endpoint,
	}
	fmt.Println("GOOGLE_CLIENT_ID: ", os.Getenv("GOOGLE_CLIENT_ID"))
	fmt.Println("GOOGLE_CLIENT_SECRET: ", os.Getenv("GOOGLE_CLIENT_SECRET"))
	fmt.Println("GOOGLE_REDIRECT_URL: ", os.Getenv("GOOGLE_REDIRECT_URL"))

	return AppConfig.GoogleLoginConfig
}
