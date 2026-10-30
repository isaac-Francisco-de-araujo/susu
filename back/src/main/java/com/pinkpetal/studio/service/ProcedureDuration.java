package com.pinkpetal.studio.service;

import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class ProcedureDuration {
    private static final Pattern HOURS = Pattern.compile("(\\d{1,2})\\s*h(?:oras?)?\\s*(?:(\\d{1,2})\\s*(?:min(?:utos?)?)?)?");
    private static final Pattern MINUTES = Pattern.compile("(\\d{1,4})\\s*(?:min(?:utos?)?)?");
    private ProcedureDuration() {}
    public static int minutes(String value) {
        String text = value.trim().toLowerCase(Locale.ROOT);
        var hours = HOURS.matcher(text);
        var minutes = MINUTES.matcher(text);
        int result = 0;
        if (hours.matches()) result = Integer.parseInt(hours.group(1)) * 60 + (hours.group(2) == null ? 0 : Integer.parseInt(hours.group(2)));
        else if (minutes.matches()) result = Integer.parseInt(minutes.group(1));
        if (result < 1 || result > 1440)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe uma duração de 1 a 1440 minutos, por exemplo 40 min ou 1h30");
        return result;
    }
}
