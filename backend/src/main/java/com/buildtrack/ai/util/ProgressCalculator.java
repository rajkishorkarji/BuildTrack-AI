package com.buildtrack.ai.util;

import java.util.List;

public class ProgressCalculator {

    public static int calculateOverallProgress(List<Integer> taskProgresses) {
        if (taskProgresses == null || taskProgresses.isEmpty()) {
            return 0;
        }
        int sum = taskProgresses.stream().mapToInt(Integer::intValue).sum();
        return (int) Math.round((double) sum / taskProgresses.size());
    }
}
