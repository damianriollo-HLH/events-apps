<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $event->title }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body class="bg-light">

    <div class="container mt-5">
        <a href="{{ url('/events') }}" class="btn btn-outline-secondary mb-3">&larr; Volver a eventos</a>

        <div class="card shadow-sm">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h1 class="display-5 fw-bold">{{ $event->title }}</h1>
                        <p class="text-muted">
                            <i class="bi bi-calendar-event"></i> {{ $event->start_at->format('d/m/Y H:i') }} | 
                            <i class="bi bi-geo-alt"></i> {{ $event->location_name ?? 'Ubicación por definir' }}
                        </p>
                        
                        <hr>
                        
                        <h5>Descripción</h5>
                        <p class="lead">{{ $event->description }}</p>
                        
                        <div class="mt-4">
                            <h4 class="text-primary">{{ $event->price > 0 ? $event->price . '€' : 'Gratis' }}</h4>
                        </div>
                    </div>

                    <div class="col-md-4 border-start">
                        <div class="p-3">
                            <input type="hidden" id="event-id" value="{{ $event->id }}">

                            <div class="text-center mb-4">
                                <button 
                                    id="btn-like" 
                                    class="btn {{ $event->is_liked ? 'btn-danger' : 'btn-outline-danger' }} rounded-circle p-3 mb-2" 
                                    style="width: 60px; height: 60px;"
                                    onclick="toggleLike()"
                                >
                                    <i id="like-icon" class="bi {{ $event->is_liked ? 'bi-heart-fill' : 'bi-heart' }} fs-3"></i>
                                </button>
                                <div>
                                    <span id="likes-count" class="fw-bold fs-4">{{ $event->likes_count }}</span> 
                                    <span class="text-muted">Likes</span>
                                </div>
                            </div>

                            <div class="d-grid gap-2">
                                @if(auth()->check() && auth()->id() === $event->user_id)
                                    <button class="btn btn-secondary" disabled>Eres el organizador</button>
                                @else
                                    <button id="btn-enroll" class="btn btn-primary btn-lg" onclick="toggleEnroll()">
                                        Inscribirse ahora
                                    </button>
                                @endif
                            </div>
                            <div id="enroll-message" class="mt-2 text-center small fw-bold"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Configuración inicial
        const eventId = document.getElementById('event-id').value;
        const btnLike = document.getElementById('btn-like');
        const likeIcon = document.getElementById('like-icon');
        const likesCountSpan = document.getElementById('likes-count');
        const btnEnroll = document.getElementById('btn-enroll');
        const enrollMsg = document.getElementById('enroll-message');

        // Token de localStorage (asegúrate de guardarlo al hacer login)
        const token = localStorage.getItem('auth_token');

        // Configurar Axios con el token si existe
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // --- FUNCIÓN LIKE ---
        function toggleLike() {
            if (!token) return alert("Debes iniciar sesión para dar like");

            btnLike.disabled = true;

            axios.post(`/api/events/${eventId}/like`)
                .then(res => {
                    const data = res.data;
                    likesCountSpan.innerText = data.likes_count;
                    
                    if (data.liked) {
                        btnLike.classList.replace('btn-outline-danger', 'btn-danger');
                        likeIcon.classList.replace('bi-heart', 'bi-heart-fill');
                    } else {
                        btnLike.classList.replace('btn-danger', 'btn-outline-danger');
                        likeIcon.classList.replace('bi-heart-fill', 'bi-heart');
                    }
                })
                .catch(err => alert("Error al procesar like"))
                .finally(() => btnLike.disabled = false);
        }

        // --- FUNCIÓN INSCRIPCIÓN ---
        function toggleEnroll() {
            if (!token) return alert("Debes iniciar sesión para inscribirte");

            btnEnroll.disabled = true;
            btnEnroll.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';

            axios.post(`/api/events/${eventId}/enroll`)
                .then(res => {
                    btnEnroll.innerText = "¡Inscrito!";
                    btnEnroll.classList.replace('btn-primary', 'btn-success');
                    enrollMsg.innerText = "Te has apuntado correctamente.";
                    enrollMsg.classList.add('text-success');
                })
                .catch(err => {
                    btnEnroll.disabled = false;
                    btnEnroll.innerText = "Inscribirse ahora";
                    
                    if (err.response && err.response.status === 409) {
                        enrollMsg.innerText = "Ya estás inscrito en este evento.";
                        enrollMsg.classList.add('text-warning');
                        btnEnroll.innerText = "Ya inscrito";
                        btnEnroll.disabled = true;
                    } else {
                        alert("Error: " + (err.response?.data?.message || "Falló la inscripción"));
                    }
                });
        }
    </script>
</body>
</html>