package com.example.appointment.controller;

import com.example.appointment.dto.LoginRequest;
import com.example.appointment.entity.User;
import com.example.appointment.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest req) {
        return userService.login(req.getEmail(), req.getPassword());
    }
}
