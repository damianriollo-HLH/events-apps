<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EventosApp</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
</head>
<body class="bg-light">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div class="container">
            <a class="navbar-brand" href="#">EventosApp</a>
            <div class="d-flex gap-2">
                @auth
                    <span class="text-white my-auto me-2">Hola, {{ auth()->user()->name }}</span>
                    <form method="POST" action="{{ url('/logout') }}">
                        @csrf 
                        <button class="btn btn-outline-light btn-sm">Salir</button>
                    </form>
                @else
                    <a href="{{ url('/login') }}" class="btn btn-outline-light btn-sm">Iniciar Sesión</a>
                    <a href="{{ url('/register') }}" class="btn btn-primary btn-sm">Registrarse</a>
                @endauth
            </div>
        </div>
    </nav>

    <div class="container">
        <h1 class="mb-4">Próximos Eventos</h1>

        @if(isset($events) && count($events) > 0)
            <div class="row">
                @foreach($events as $event)
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">{{ $event->title }}</h5>
                                <p class="card-text text-muted small">
                                    <i class="bi bi-calendar"></i> {{ $event->start_at->format('d/m/Y') }} <br>
                                    <i class="bi bi-geo-alt"></i> {{ $event->location_name ?? 'Online' }}
                                </p>
                                <p class="card-text">{{ Str::limit($event->description, 80) }}</p>
                            </div>
                            <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
                                <span class="fw-bold text-primary">{{ $event->price > 0 ? $event->price . '€' : 'Gratis' }}</span>
                                <a href="{{ url('/events/' . $event->id) }}" class="btn btn-sm btn-outline-primary">
                                    Ver detalles &rarr;
                                </a>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="alert alert-info text-center">
                No hay eventos disponibles en este momento. ¡Crea algunos en la base de datos!
            </div>
        @endif
    </div>

</body>
</html>