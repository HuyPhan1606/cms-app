# Content Management System (CMS) Project

A modern content management system featuring a backend API, admin frontend, and client frontend. Built with **NestJS**, **React**, **Docker**, and **MongoDB Atlas**, this project is designed to provide a scalable and maintainable CMS solution.

> ** Live deployment** is powered by **GitHub Actions** and containerized via **Docker**.

---

## Tech Stack

-   **Backend**: NestJS (TypeScript)
-   **Frontend**: React (Admin & Client)
-   **Database**: MongoDB Atlas
-   **CI/CD**: GitHub Actions
-   **Containerization**: Docker, Docker Compose

---

## Requirements

Before running this project locally, ensure you have the following installed:

-   [Docker](https://www.docker.com/get-started) `>= 20.10`
-   Docker Compose `>= 1.29` (usually included with Docker)
-   [Git](https://git-scm.com/)
-   Internet connection (to pull images and connect to MongoDB Atlas)

---

## Installation

Follow these steps to set up and run the project locally:

1. **Clone the repository**

    ```bash
    git clone https://github.com/HuyPhan1606/cms-app.git
    cd cms-app
    ```

2. **Create environment file**

    > ** Note:** You must create a `.env` file in the `backend/` directory before running Docker Compose. This file should contain the necessary environment variables to connect to MongoDB Atlas and configure the backend.

    I have a .env example in backend folder, so you can leverage it and fill in your infos to make it run.

3. **Build and run the project using Docker Compose**
    ```bash
    docker-compose -f docker-compose-demo.yml up -d --build
    ```

---

## Accessing the Application

After successful startup, you can access the following URLs:

### Admin / Editor Page

-   URL: [http://localhost:8080/](http://localhost:8080/)

### Client Page

-   URL: [http://localhost:8081/](http://localhost:8081/)

---

## Project Structure Overview

```
cms-app/
│
├── backend/           # NestJS backend
│   └── .env           # Environment file (must create)
│
├── admin-frontend/    # Admin or Editor page in React
├── client-frontend/   # Public-facing site in React
├── docker-compose-demo.yml # Build my app in Docker
└── README.md
```

---

## Contact & Contributions

Feel free to submit an issue or pull request!

> Created by [Huy Phan](https://github.com/HuyPhan1606) – Contributions are welcome!

---

## License

This project is licensed under the [MIT License](LICENSE).
