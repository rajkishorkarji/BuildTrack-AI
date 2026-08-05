package com.buildtrack.ai.util;

public class PayrollCalculator {

    public static double calculateWages(double hourlyRate, double hoursWorked, double overtimeHours) {
        double regularPay = Math.min(hoursWorked, 40.0) * hourlyRate;
        double overtimePay = overtimeHours * (hourlyRate * 1.5);
        return regularPay + overtimePay;
    }
}
