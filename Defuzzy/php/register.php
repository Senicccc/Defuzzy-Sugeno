<?php
require_once 'auth.php';
redirectIfLoggedIn();

$error = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirmPassword = trim($_POST['confirm_password']);

    if (empty($username) || empty($email) || empty($password)) {
        $error = 'Username, email, dan password harus diisi';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Format email tidak valid';
    } elseif ($password !== $confirmPassword) {
        $error = 'Password dan konfirmasi password tidak sama';
    } else {
        $result = registerUser($username, $email, $password);

        if ($result['success']) {
            $success = true;
        } else {
            $error = $result['message'];
        }
    }
}
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Sistem Fuzzy Sugeno</title>
    <link rel="stylesheet" href="../css/login.css">
</head>

<body>
    <div class="login-container">
        <h1>Register</h1>

        <?php if ($error): ?>
        <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <?php if ($success): ?>
        <div class="success-message">
            Registrasi berhasil! Silakan <a href="login.php">login</a>.
        </div>
        <?php else: ?>
        <form method="POST">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>

            <div class="form-group">
                <label for="confirm_password">Konfirmasi Password</label>
                <input type="password" id="confirm_password" name="confirm_password" required>
            </div>

            <button type="submit" class="login-btn">Daftar</button>
        </form>

        <p class="register-link">Ingin tetap menggunakan web tanpa login? <a href="form.php">Klik disini</a></p>
        <p class="register-link">Sudah punya akun? <a href="login.php">Login disini</a></p>
        <?php endif; ?>
    </div>
</body>

</html>