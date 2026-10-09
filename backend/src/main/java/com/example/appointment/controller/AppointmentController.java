package com.example.appointment.controller;

import com.example.appointment.dto.BookingRequest;
import com.example.appointment.entity.Appointment;
import com.example.appointment.service.AppointmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public Appointment book(@RequestBody BookingRequest req) {
        return appointmentService.book(req);
    }

    @GetMapping
    public List<Appointment> all() {
        return appointmentService.getAll();
    }

    @GetMapping("/patient/{id}")
    public List<Appointment> byPatient(@PathVariable Long id) {
        return appointmentService.getByPatient(id);
    }

    @GetMapping("/doctor/{id}")
    public List<Appointment> byDoctor(@PathVariable Long id) {
        return appointmentService.getByDoctor(id);
    }

    @GetMapping("/doctor/{id}/booked")
    public List<String> bookedTimes(@PathVariable Long id,
                                    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentService.getBookedTimes(id, date);
    }

    @PutMapping("/{id}/cancel")
    public Appointment cancel(@PathVariable Long id) {
        return appointmentService.cancel(id);
    }
}
