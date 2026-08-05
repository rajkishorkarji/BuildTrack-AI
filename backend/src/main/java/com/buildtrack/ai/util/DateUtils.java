package com.buildtrack.ai.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DateUtils {

    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static String formatDate(LocalDate date) {
        return date != null ? date.format(DEFAULT_FORMATTER) : "";
    }

    public static LocalDate parseDate(String dateStr) {
        return (dateStr != null && !dateStr.isBlank()) ? LocalDate.parse(dateStr, DEFAULT_FORMATTER) : null;
    }

    public static long daysBetween(LocalDate start, LocalDate end) {
        if (start == null || end == null) return 0;
        return ChronoUnit.DAYS.between(start, end);
    }
}
