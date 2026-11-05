var app = angular.module("studentApp", []);

app.controller("StudentController", function ($scope, $http) {

    var API_URL = "https://icjtrsofmovjxclyxndw.supabase.co/rest/v1/students ",
    var API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljanRyc29mbW92anhjbHl4bmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NTk4NjEsImV4cCI6MjEwOTMzNTg2MX0.NQhgEwVR8P83C_CELt759u0gqKezD9wv4IimosqwxEc 
"; 
    var config = {
        headers: {
            "apikey": API_KEY,
            "Authorization": "Bearer " + API_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    };

    $scope.students = [];
    $scope.student = {};

    // READ: Fetch all students
    $scope.getStudents = function () {
        $http.get(API_URL + "?select=*", config)
            .then(function (response) {
                $scope.students = response.data;
            });
    };

    // CREATE: Add a student
    // UPDATE: Edit an existing student
    $scope.saveStudent = function () {

        if ($scope.student.id) {

            $http.patch(
                API_URL + "?id=eq." + $scope.student.id,
                {
                    name: $scope.student.name,
                    department: $scope.student.department
                },
                config
            ).then(function () {
                $scope.student = {};
                $scope.getStudents();
            });

        } else {

            $http.post(API_URL, $scope.student, config)
                .then(function () {
                    $scope.student = {};
                    $scope.getStudents();
                });

        }
    };

    // Select a student for editing
    $scope.editStudent = function (student) {
        $scope.student = angular.copy(student);
    };

    // Cancel editing
    $scope.cancelEdit = function () {
        $scope.student = {};
    };

    // DELETE: Remove a student
    $scope.deleteStudent = function (id) {
        $http.delete(API_URL + "?id=eq." + id, config)
            .then(function () {
                $scope.getStudents();
            });
    };

    // Load students when the application starts
    $scope.getStudents();

});