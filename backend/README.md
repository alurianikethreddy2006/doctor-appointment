# MediBook - Online Doctor Appointment System (Java Full Stack)

Spring Boot + Spring Data JPA + MySQL backend, HTML/CSS/JavaScript frontend.

## Requirements
JDK 17, Maven (or IntelliJ), MySQL 8 running on port 3306.

## First-time setup
1. In MySQL Workbench run:  DROP DATABASE IF EXISTS doctor_appointment;   (only needed if you used an older version of this project)
2. Open src/main/resources/application.properties and set your MySQL username/password (and server.port if 8080 is busy).
3. Run:  mvn spring-boot:run   (or run AppointmentApplication.java in IntelliJ)
4. Open http://localhost:8080  (or your port)

Tables, 5 hospitals, 20 doctors and the admin account are created automatically.

## Admin login
Email: admin@hospital.com   Password: admin123
After login you are taken to the Admin Panel (add hospitals, add doctors with fee, view all appointments).

## Pages
index, hospitals, doctors, book, my-appointments, login, register, admin  (all in src/main/resources/static)

## Hospital images
Images are in static/images (hospital1.svg ... hospital5.svg). To use a real photo, copy it into that folder
and type its path (e.g. images/mypic.jpg) when adding the hospital in the Admin Panel, or change it in AppointmentApplication.java.

## REST APIs
POST /api/users/register, POST /api/users/login
GET/POST /api/hospitals, DELETE /api/hospitals/{id}
GET/POST /api/doctors, GET /api/doctors/hospital/{id}, DELETE /api/doctors/{id}
POST /api/appointments, GET /api/appointments, GET /api/appointments/patient/{id},
GET /api/appointments/doctor/{id}/booked?date=YYYY-MM-DD, PUT /api/appointments/{id}/cancel

## Notes
Passwords are plain text and the admin page is only protected in the browser - fine for learning,
but a real project needs Spring Security + BCrypt.
