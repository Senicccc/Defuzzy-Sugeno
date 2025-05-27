<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fuzzy Sugeno - Produksi</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    body {
        background: #f0f4f8;
        color: #333;
    }

    nav {
        background-color: #004d99;
        position: sticky;
        top: 0;
        z-index: 1000;
        padding: 1.4rem 2.4rem;
    }

    .nav-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        flex-wrap: wrap;
    }

    .logo {
        color: white;
        font-weight: 800;
        font-size: larger;
    }

    .nav-links {
        display: flex;
        gap: 2rem;
    }

    .nav-links a {
        text-decoration: none;
        color: white;
        font-weight: 500;
        font-size: 1rem;
        transition: color 0.3s;
    }

    .nav-links a:hover {
        color: #ffcc00;
    }

    .burger {
        display: none;
        font-size: 1.5rem;
        color: white;
        cursor: pointer;
        padding: 0.5rem;
    }

    @media (max-width: 768px) {
        .nav-links {
            display: none;
            flex-direction: column;
            background-color: #004d99;
            width: 100%;
            text-align: center;
            margin-top: 1rem;
            padding-bottom: 1rem;
            gap: 1rem;
            order: 1;
        }

        .nav-links.active {
            display: flex;
        }

        .burger {
            display: block;
            margin-left: auto;
            /* Memposisikan burger di kanan */
        }

        nav {
            padding: 0.75rem 1.5rem;
        }
    }
    </style>
</head>

<body>

    <nav>
        <div class="nav-container">
            <div class="logo">Fuzzy Sugeno</div>
            <div class="burger" id="burger"><i class="fas fa-bars"></i></div>
            <div class="nav-links" id="navLinks">
                <a href="../index.php">Home</a>
                <a href="../index.php#about">About</a>
                <a href="form.php">Hitung</a>
                <a href="account.php">Akun</a>
                <?php if (isset($_SESSION['user_id'])): ?>
                <a href="logout.php">Logout</a>
                <?php else: ?>
                <a href="login.php">Login</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>

    <script>
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    </script>

</body>

</html>