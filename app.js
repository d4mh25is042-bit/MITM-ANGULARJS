// =====================================
// SUPABASE DATABASE CONNECTION
// =====================================

const SUPABASE_URL = "https://icjtrsofmovjxclyxndw.supabase.co" 
;
const SUPABASE_KEY = "sb_publishable_pM9LwrXCCCEEFzvVRnzCKQ_B0qqBJDJ";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================
// ANGULARJS APPLICATION
// =====================================

var app = angular.module("eventApp", []);

app.controller("eventController", function ($scope) {

    // =====================================
    // INITIAL VARIABLES
    // =====================================

    $scope.loggedIn = false;
    $scope.loginType = "";
    $scope.loginError = "";

    $scope.student = {};
    $scope.admin = {};
    $scope.currentUser = {};

    $scope.events = [];
    $scope.registrations = [];
    $scope.feedbacks = [];

    $scope.registration = {};
    $scope.newEvent = {};
    $scope.feedback = {};

    $scope.registrationMessage = "";
    $scope.eventMessage = "";
    $scope.feedbackMessage = "";

    $scope.loading = false;


    // =====================================
    // ERROR HANDLING
    // =====================================

    function showError(error, message) {

        console.error(message, error);

        $scope.$applyAsync(function () {
            $scope.loading = false;
            $scope.errorMessage =
                message + " " + (error.message || "");
        });

    }


    // =====================================
    // LOAD EVENTS FROM SUPABASE
    // =====================================

    $scope.loadEvents = async function () {

        try {

            $scope.loading = true;

            const { data, error } = await supabaseClient
                .from("events")
                .select("*")
                .order("date", { ascending: true });

            if (error) throw error;

            $scope.$applyAsync(function () {

                $scope.events = data || [];
                $scope.loading = false;

            });

        }

        catch (error) {

            showError(error, "Unable to load events.");

        }

    };


    // =====================================
    // LOAD REGISTRATIONS
    // =====================================

    $scope.loadRegistration = async function () {

        try {

            const { data, error } = await supabaseClient
                .from("registration")
                .select("*");

            if (error) throw error;

            $scope.$applyAsync(function () {

                $scope.registration = (data || []).map(function (item) {

                    return {
                        id: item.id,
                        name: item.student_name,
                        usn: item.usn,
                        department: item.department,
                        email: item.email,
                        event: item.event_name,
                        date: item.registration_date,
                        status: item.status
                    };

                });

            });

        }

        catch (error) {

            showError(error, "Unable to load registrations.");

        }

    };


    // =====================================
    // LOAD FEEDBACK
    // =====================================

    $scope.loadFeedback = async function () {

        try {

            const { data, error } = await supabaseClient
                .from("feedback")
                .select("*");

            if (error) throw error;

            $scope.$applyAsync(function () {

                $scope.feedback = (data || []).map(function (item) {

                    return {
                        id: item.id,
                        name: item.student_name,
                        usn: item.usn,
                        department: item.department,
                        message: item.message,
                        date: item.feedback_date
                    };

                });

            });

        }

        catch (error) {

            showError(error, "Unable to load feedback.");

        }

    };


    // =====================================
    // STUDENT LOGIN
    // =====================================

    $scope.studentLogin = function () {

        if (
            !$scope.student.name ||
            !$scope.student.usn ||
            !$scope.student.department ||
            !$scope.student.email
        ) {

            $scope.loginError =
                "Please fill all student details.";

            return;

        }

        $scope.currentUser = {

            name: $scope.student.name.trim(),
            usn: $scope.student.usn.trim().toUpperCase(),
            department: $scope.student.department.trim(),
            email: $scope.student.email.trim(),
            role: "Student"

        };

        // This is a demonstration login, not verified authentication.
        $scope.loggedIn = true;
        $scope.loginError = "";

        $scope.registration = {

            name: $scope.currentUser.name,
            usn: $scope.currentUser.usn,
            department: $scope.currentUser.department,
            email: $scope.currentUser.email,
            event: ""

        };

        $scope.loadEvents();

    };


    // =====================================
    // ADMIN LOGIN
    // =====================================

    $scope.adminLogin = function () {

        if (
            $scope.admin.username === "admin" &&
            $scope.admin.password === "admin123"
        ) {

            $scope.currentUser = {

                name: "Administrator",
                role: "Admin"

            };

            // Demo login only. Not secure authentication.
            $scope.loggedIn = true;
            $scope.loginError = "";

            $scope.loadEvents();
            $scope.loadRegistration();
            $scope.loadFeedback();

        }

        else {

            $scope.loginError =
                "Invalid username or password.";

        }

    };


    // =====================================
    // LOGOUT
    // =====================================

    $scope.logout = function () {

        $scope.loggedIn = false;

        $scope.currentUser = {};
        $scope.student = {};
        $scope.admin = {};

        $scope.registration = {};
        $scope.feedback = {};
        $scope.newEvent = {};

        $scope.loginType = "";
        $scope.loginError = "";

        $scope.registrationMessage = "";
        $scope.feedbackMessage = "";
        $scope.eventMessage = "";
        $scope.errorMessage = "";

    };


    // =====================================
    // SELECT EVENT
    // =====================================

    $scope.selectEvent = function (event) {

        $scope.registration = {

            name: $scope.currentUser.name,
            usn: $scope.currentUser.usn,
            department: $scope.currentUser.department,
            email: $scope.currentUser.email,
            event: event.name

        };

        $scope.registrationMessage = "";

        document.getElementById("registration")
           section.scrollIntoView({
                behavior: "smooth"
            });

    };


    // =====================================
    // STUDENT EVENT REGISTRATION
    // =====================================

    $scope.registerStudent = async function () {

        if (!$scope.registration.event) {

            $scope.registrationMessage =
                "Please select an event.";

            return; 

        }

        const selectedEvent = $scope.events.find(function (event) {

            return event.name === $scope.registration.event;

        });

        if (!selectedEvent) {

            $scope.registrationMessage =
                "This event is no longer available.";

            return;

        }

        try {

            const { data: existing, error: checkError } =
                await supabaseClient
                    .from("registration")
                    .select("id")
                    .eq("usn", $scope.currentUser.usn)
                    .eq("event_name", $scope.registration.event);

            if (checkError) throw checkError;

            if (existing && existing.length > 0) {

                $scope.$applyAsync(function () {

                    $scope.registrationMessage =
                        "You have already registered for this event."; 

                });

                return;

            }

            const newRegistration = {

                student_name: $scope.currentUser.name,
                usn: $scope.currentUser.usn,
                department: $scope.currentUser.department,
                email: $scope.currentUser.email,
                event_name: $scope.registration.event,
                registrations_date:
                    new Date().toISOString().split("T")[0],
                status: "Registered"

            };

            const { data, error } = await supabaseClient
                .from("registration")
                .insert([newRegistration])
                .select();

            if (error) throw error;

            $scope.$applyAsync(function () {

                $scope.registrationMessage =
                    "Registration successful!";

                $scope.registration.event = "";

                $scope.loadRegistration();

            });

        }

        catch (error) {

            showError(error, "Registration failed.");

            $scope.$applyAsync(function () {

                $scope.registrationMessage =
                    "Registration failed. Check database permissions.";

            });

        }

    };


    // =====================================
    // ADD NEW EVENT - ADMIN
    // =====================================

    $scope.addEvent = async function () {

        if (
            !$scope.newEvent.name ||
            !$scope.newEvent.date ||
            !$scope.newEvent.venue ||
            !$scope.newEvent.description
        ) {

            $scope.eventMessage =
                "Please fill all event details.";

            return;

        }

        const duplicate = $scope.events.some(function (event) {

            return event.name.toLowerCase() ===
                $scope.newEvent.name.trim().toLowerCase();

        });

        if (duplicate) {

            $scope.eventMessage =
                "This event already exists.";

            return;

        }

        try {

            const eventDate = $scope.newEvent.date instanceof Date
                ? $scope.newEvent.date.toISOString().split("T")[0]
                : $scope.newEvent.date;

            const eventData = {

                name: $scope.newEvent.name.trim(),
                date: eventDate,
                venue: $scope.newEvent.venue.trim(),
                description: $scope.newEvent.description.trim()

            };

            const { error } = await supabaseClient
                .from("events")
                .insert([eventData]);

            if (error) throw error;

            $scope.$applyAsync(function () {

                $scope.eventMessage =
                    "Event added successfully!";

                $scope.newEvent = {};

                $scope.loadEvents();

            });

        }

        catch (error) {

            showError(error, "Unable to add event.");

            $scope.$applyAsync(function () {

                $scope.eventMessage =
                    "Unable to add event. Check database permissions.";

            });

        }

    };


    // =====================================
    // DELETE EVENT - ADMIN
    // =====================================

    $scope.deleteEvent = async function (index) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmDelete) return;

        const event = $scope.events[index];

        if (!event || !event.id) {

            $scope.eventMessage =
                "Event ID is missing.";

            return;

        }

        try {

            const { error } = await supabaseClient
                .from("events")
                .delete()
                .eq("id", event.id);

            if (error) throw error;

            $scope.$applyAsync(function () {

                $scope.eventMessage =
                    "Event deleted successfully!";

                $scope.loadEvents();

            });

        }

        catch (error) {

            showError(error, "Unable to delete event.");

        }

    };


    // =====================================
    // STUDENT FEEDBACK
    // =====================================

    $scope.submitFeedback = async function () {

        if (
            !$scope.feedback.message ||
            !$scope.feedback.message.trim()
        ) {

            $scope.feedbackMessage =
                "Please enter your feedback.";

            return;

        }

        try {

            const feedbackData = {

                student_name: $scope.currentUser.name,
                usn: $scope.currentUser.usn,
                department: $scope.currentUser.department,
                message: $scope.feedback.message.trim(),
                feedback_date:
                    new Date().toISOString().split("T")[0]

            };

            const { error } = await supabaseClient
                .from("feedback")
                .insert([feedbackData]);

            if (error) throw error;

            $scope.$applyAsync(function () {

                $scope.feedbackMessage =
                    "Thank you! Your feedback has been submitted.";

                $scope.feedback = {};

            });

        }

        catch (error) {

            showError(error, "Unable to submit feedback.");

            $scope.$applyAsync(function () {

                $scope.feedbackMessage =
                    "Feedback submission failed. Check database permissions.";

            });

        }

    };


    // =====================================
    // INITIAL DATABASE CHECK
    // =====================================

    console.log("College Event Registration System started.");

    console.log("Supabase client initialized.");

}); 