
async function validateSignupInputs(e) {
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    const workEx = Number(document.getElementById("work").value);
    const email = document.getElementById("email").value;
    const AspUni = document.getElementById("uni").value;
    const confirm_pass = document.getElementById("confirm-password").value;
    let errorMessage = null;
    if (!name) {
        errorMessage = "name must be present";
    }
    else if (name == null) {
        errorMessage = "name cannot be null";
    }
    else if (name == undefined) {
        errorMessage = "name not defined";
    }
    else if (name.length < 5 || name.length > 15) {
        errorMessage = "Enter a User Name with more than 4 and less than 15 characters";
    }

    else if (!email) {
        errorMessage = "You must provide a email";
    }
    else if (email == null || email.length == 0) {
        errorMessage = "email cannot be null";
    }
    else if (email == undefined) {
        errorMessage = "email not defined";
    }
    else if (!validateEmail(email)) {
        errorMessage = "Enter email only with valid characters";
    }
    else if (!workEx || workEx == null || workEx == undefined) {
        errorMessage = "Please enter 0 if you dont have work experience";
    }
    else if (typeof workEx == 'string') {
        errorMessage = "Work Experience should be a number";
    }
    else if (workEx < 0 || workEx > 100) {
        errorMessage = "Please enter 0 if you dont have work experience";
    }
    else if (!password) {
        errorMessage = "You must provide a password post";
    }
    else if (password == null) {
        errorMessage = "password cannot be null";
    }
    else if (password == undefined) {
        errorMessage = "password not defined";
    }
    else if (password.length < 6 || password.length > 20) {
        errorMessage = "Enter a password with more than 6 and less than 20 characters";
    }
    else if (!password.match(/^(?!\s*$).+/)) {
        errorMessage = "Enter password only with valid characters";
    }
    else if (!confirm_pass) {
        errorMessage = "You must provide a confirm password";
    }
    else if (confirm_pass == null) {
        errorMessage = "confirm password cannot be null";
    }
    else if (confirm_pass == undefined) {
        errorMessage = "confirm password not defined";
    }
    else if (confirm_pass != password) {
        errorMessage = "password and confirm password do not match.";
    }

    else {
        errorMessage = null;
    }

    if (errorMessage == null) {
        return true;
    }
    else {
        e.preventDefault();
        alert(errorMessage);
        return false;
    }
}

function validateEmail(email) {
    const regexEmail = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;
    if (email.match(regexEmail)) {
        return true;
    }
    else {
        return false;
    }
}

async function validateSignInInputs(e) {
    e.preventDefault();
 
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    let errorMessage = null;
    if (!email) {
        errorMessage = "email must be present";
    }
    else if (email == null) {
        errorMessage = "email cannot be null";
    }
    else if (email == undefined) {
        errorMessage = "email not defined";
    }
    
    else if (!validateEmail(email)) {
        errorMessage = "Enter a email with valid characters";
    }
   
    else if (!password) {
        errorMessage = "You must provide a password";
    }
    else if (password == null) {
        errorMessage = "password cannot be null";
    }
    else if (password == undefined) {
        errorMessage = "password not defined";
    }
    else if (password.length < 6 || password.length > 20) {
        errorMessage = "Enter a password with more than 6 and less than 20 characters";
    }
    else if (!password.match(/^(?!\s*$).+/)) {
        errorMessage = "Enter password only with valid characters";
    }
    else {
        errorMessage = null;
    }

    if (errorMessage == null) {
        let res = await postLoginData();
        if (res.status == true) {
            window.location.href = "/profile";
        }
        else {
            document.getElementById("error-div").style.display = "block";
            document.getElementById("error-line").innerText = res.error;
        }
    }
    else {
        alert(errorMessage);
    }
    return false;
}

async function postLoginData() {
    const response = await fetch("/login", {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: document.getElementById("email").value, password: document.getElementById("password").value })
    });
    return await response.json();
}

function confirmAccountDeletion() {
    let r = confirm("Are you sure?");
    if (r == true) {
        window.location.href = '/remove_profile';
    }
}

async function validateUpdateProfileInputs(e) {
    // const password = document.getElementById("password").value;
    // const confirm_pass = document.getElementById("confirm-password").value;
    const name = document.getElementById("name").value;
    const WorkEx = Number(document.getElementById("work").value);
    const email = document.getElementById("email").value;
    const aspuni = document.getElementById("uni").value;
    let errorMessage = null;

    if (!name) {
        errorMessage = "You must provide a name";
    }
    else if (name == null || name.length == 0) {
        errorMessage = "name cannot be null";
    }
    else if (name == undefined) {
        errorMessage = "name not defined";
    }

    if (!email) {
        errorMessage = "You must provide a email post";
    }
    else if (email == null || email.length == 0) {
        errorMessage = "email cannot be null";
    }
    else if (email == undefined) {
        errorMessage = "email not defined";
    }
    else if (!validateEmail(email)) {
        errorMessage = "Enter email only with valid characters";
    }

    if (!aspuni) {
        errorMessage = "You must provide a Aspiring University";
    }
    else if (aspuni == null || aspuni.length == 0) {
        errorMessage = "Aspiring University cannot be null";
    }
    else if (aspuni == undefined) {
        errorMessage = "Aspiring University not defined";
    }

    else if (!WorkEx || WorkEx == null || WorkEx == undefined) {
        errorMessage = "Invalid Work Experience parameters";
    }
    else if (typeof WorkEx == 'string') {
        errorMessage = "Work Experience should be a number";
    }
    else if (WorkEx < 1 || WorkEx > 100) {
        errorMessage = "Invalid Work Experience";
    }
    // else if (password && password.length < 6 || password.length > 20) {
    //     errorMessage = "Enter a password with more than 6 and less than 20 characters";
    // }
    // else if (password && !password.match(/^(?!\s*$).+/)) {
    //     errorMessage = "Enter password only with valid characters";
    // }
    // else if (!confirm_pass) {
    //     errorMessage = "You must provide a confirm password";
    // }
    // else if (confirm_pass == null) {
    //     errorMessage = "confirm password cannot be null";
    // }
    // else if (confirm_pass == undefined) {
    //     errorMessage = "confirm password not defined";
    // }
    // else if (confirm_pass != password) {
    //     errorMessage = "password and confirm password do not match.";
    // }
    else {
        errorMessage = null;
    }

    if (errorMessage == null) {
        return true;
    }
    else {
        e.preventDefault();
        alert(errorMessage);
        return false;
    }
}
