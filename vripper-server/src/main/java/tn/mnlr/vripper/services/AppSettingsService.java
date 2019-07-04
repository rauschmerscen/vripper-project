package tn.mnlr.vripper.services;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.codec.digest.DigestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tn.mnlr.vripper.exception.ValidationException;

import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;

@Service
@Getter
@Setter
public class AppSettingsService {

    private static final Logger logger = LoggerFactory.getLogger(AppSettingsService.class);

    private Preferences prefs = Preferences.userNodeForPackage(AppSettingsService.class);

    private final String DOWNLOAD_PATH = "DOWNLOAD_PATH";
    private final String MAX_THREADS = "MAX_THREADS";
    private final String AUTO_START = "AUTO_START";
    private final String V_LOGIN = "VLOGIN";
    private final String V_USERNAME = "VUSERNAME";
    private final String V_PASSWORD = "VPASSWORD";
    private final String V_THANKS = "VTHANKS";

    private String downloadPath;
    private int maxThreads;
    private boolean autoStart;
    private boolean vLogin;
    private String vUsername;
    private String vPassword;
    private boolean vThanks;

    public void setVPassword(String vPassword) {
        if(vPassword.isEmpty()) {
            this.vPassword = "";
        } else {
            this.vPassword = DigestUtils.md5Hex(vPassword);
        }
    }

    public void restore() {

        downloadPath = prefs.get(DOWNLOAD_PATH, System.getProperty("user.dir"));
        maxThreads = prefs.getInt(MAX_THREADS, 4);
        autoStart = prefs.getBoolean(AUTO_START, true);
        vLogin = prefs.getBoolean(V_LOGIN, false);
        vUsername = prefs.get(V_USERNAME, "");
        vPassword = prefs.get(V_PASSWORD, "");
        vThanks = prefs.getBoolean(V_THANKS, false);
    }

    public void save() {

        prefs.put(DOWNLOAD_PATH, downloadPath);
        prefs.putInt(MAX_THREADS, maxThreads);
        prefs.putBoolean(AUTO_START, autoStart);
        prefs.putBoolean(V_LOGIN, vLogin);
        prefs.put(V_USERNAME, vUsername);
        prefs.put(V_PASSWORD, vPassword);
        prefs.putBoolean(V_THANKS, vThanks);

        try {
            prefs.sync();
        } catch (BackingStoreException e) {
            logger.error("Failed to store user settings", e);
        }
    }

    public void check(Settings settings) throws ValidationException {

        Path path;
        try {
            path = Paths.get(settings.getDownloadPath());
        } catch (InvalidPathException e) {
            throw new ValidationException(String.format("%s is invalid", settings.getDownloadPath()));
        }
        if (!Files.exists(path)) {
            throw new ValidationException(String.format("%s does not exist", settings.getDownloadPath()));
        } else if (!Files.isDirectory(path)) {
            throw new ValidationException(String.format("%s is not a directory", settings.getDownloadPath()));
        }

        if (settings.getMaxThreads() < 1 || settings.getMaxThreads() > 8) {
            throw new ValidationException(String.format("Invalid max concurrent download settings, values must be in [%d,%d]", 1, 8));
        }
    }

    @Getter
    public static class Settings {

        @JsonProperty("downloadPath")
        private String downloadPath;
        @JsonProperty("maxThreads")
        private int maxThreads;
        @JsonProperty("autoStart")
        private boolean autoStart;
        @JsonProperty("vLogin")
        private boolean vLogin;
        @JsonProperty("vUsername")
        private String vUsername;
        @JsonProperty("vPassword")
        private String vPassword;
        @JsonProperty("vThanks")
        private boolean vThanks;

        public Settings(String downloadPath, int maxThreads, boolean autoStart, boolean vLogin, String vUsername, String vPassword, boolean vThanks) {
            this.downloadPath = downloadPath;
            this.maxThreads = maxThreads;
            this.autoStart = autoStart;
            this.vLogin = vLogin;
            this.vUsername = vUsername;
            this.vPassword = vPassword;
            this.vThanks = vThanks;
        }
    }
}
