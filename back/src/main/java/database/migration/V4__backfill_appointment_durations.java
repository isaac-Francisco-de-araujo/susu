package database.migration;

import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

public class V4__backfill_appointment_durations extends BaseJavaMigration {
    @Override
    public void migrate(Context context) throws Exception {
        try (var read = context.getConnection().createStatement();
             var rows = read.executeQuery("SELECT a.id, s.duration FROM appointments a JOIN services s ON s.id = a.service_id");
             var update = context.getConnection().prepareStatement("UPDATE appointments SET duration_minutes = ? WHERE id = ?")) {
            while (rows.next()) {
                update.setInt(1, duration(rows.getString("duration")));
                update.setObject(2, rows.getObject("id", UUID.class));
                update.addBatch();
            }
            update.executeBatch();
        }
    }

    private int duration(String text) {
        text = text.trim().toLowerCase(Locale.ROOT);
        var hours = Pattern.compile("(\\d{1,2})\\s*h(?:oras?)?\\s*(?:(\\d{1,2})\\s*(?:min(?:utos?)?)?)?").matcher(text);
        var minutes = Pattern.compile("(\\d{1,4})\\s*(?:min(?:utos?)?)?").matcher(text);
        int value = 30;
        if (hours.matches()) value = Integer.parseInt(hours.group(1)) * 60 + (hours.group(2) == null ? 0 : Integer.parseInt(hours.group(2)));
        else if (minutes.matches()) value = Integer.parseInt(minutes.group(1));
        return value > 0 && value <= 1440 ? value : 30;
    }
}
