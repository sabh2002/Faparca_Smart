# usuarios/management/commands/crear_usuarios_prueba.py
"""
Comando para crear usuarios de prueba en el sistema.
Uso: python manage.py crear_usuarios_prueba
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from areas.models import Area

Usuario = get_user_model()

class Command(BaseCommand):
    help = 'Crea usuarios de prueba para el sistema OEE'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Elimina todos los usuarios existentes antes de crear los nuevos'
        )
        parser.add_argument(
            '--with-areas',
            action='store_true',
            help='También crea áreas de prueba si no existen'
        )

    def handle(self, *args, **options):
        with transaction.atomic():
            if options['reset']:
                self.stdout.write('Eliminando usuarios existentes...')
                Usuario.objects.exclude(is_superuser=True).delete()
                self.stdout.write(self.style.WARNING('Usuarios eliminados (excepto superusuarios)'))

            if options['with_areas']:
                self.create_test_areas()

            self.create_test_users()
            
            self.stdout.write(self.style.SUCCESS('✓ Usuarios de prueba creados exitosamente'))
            self.print_credentials()

    def create_test_areas(self):
        """Crea áreas de prueba si no existen"""
        areas_data = [
            {
                'nombre': 'Área de Empaque 1',
                'codigo': 'EMP-01',
                'tipo': 'empaque',
                'capacidad_teorica': 1000,
                'capacidad_real': 900,
                'activa': True
            },
            {
                'nombre': 'Área de Empaque 2',
                'codigo': 'EMP-02',
                'tipo': 'empaque',
                'capacidad_teorica': 1200,
                'capacidad_real': 1100,
                'activa': True
            },
            {
                'nombre': 'Prensa Principal',
                'codigo': 'PRE-01',
                'tipo': 'prensa',
                'capacidad_teorica': 2000,
                'capacidad_real': 1800,
                'activa': True
            },
            {
                'nombre': 'Prensa Secundaria',
                'codigo': 'PRE-02',
                'tipo': 'prensa',
                'capacidad_teorica': 1500,
                'capacidad_real': 1400,
                'activa': True
            }
        ]

        for area_data in areas_data:
            area, created = Area.objects.get_or_create(
                codigo=area_data['codigo'],
                defaults=area_data
            )
            if created:
                self.stdout.write(f'  ✓ Área creada: {area.nombre}')
            else:
                self.stdout.write(f'  - Área existente: {area.nombre}')

    def create_test_users(self):
        """Crea usuarios de prueba con diferentes roles"""
        
        # Obtener áreas para asignar
        areas = list(Area.objects.filter(activa=True))
        
        usuarios_data = [
            {
                'username': 'admin',
                'email': 'admin@faparca.com',
                'first_name': 'Admin',
                'last_name': 'Sistema',
                'rol': 'administrador',
                'password': 'admin123',
                'is_staff': True,
                'is_superuser': True,
                'area_asignada': None,
                'telefono': '555-0001'
            },
            {
                'username': 'supervisor1',
                'email': 'supervisor1@faparca.com',
                'first_name': 'Juan',
                'last_name': 'Pérez',
                'rol': 'supervisor',
                'password': 'super123',
                'is_staff': False,
                'area_asignada': areas[0] if areas else None,
                'telefono': '555-0002'
            },
            {
                'username': 'supervisor2',
                'email': 'supervisor2@faparca.com',
                'first_name': 'María',
                'last_name': 'García',
                'rol': 'supervisor',
                'password': 'super123',
                'is_staff': False,
                'area_asignada': areas[1] if len(areas) > 1 else None,
                'telefono': '555-0003'
            },
            {
                'username': 'operador1',
                'email': 'operador1@faparca.com',
                'first_name': 'Carlos',
                'last_name': 'López',
                'rol': 'operador',
                'password': 'oper123',
                'is_staff': False,
                'area_asignada': areas[0] if areas else None,
                'telefono': '555-0004'
            },
            {
                'username': 'operador2',
                'email': 'operador2@faparca.com',
                'first_name': 'Ana',
                'last_name': 'Martínez',
                'rol': 'operador',
                'password': 'oper123',
                'is_staff': False,
                'area_asignada': areas[1] if len(areas) > 1 else None,
                'telefono': '555-0005'
            },
            {
                'username': 'operador3',
                'email': 'operador3@faparca.com',
                'first_name': 'Pedro',
                'last_name': 'Rodríguez',
                'rol': 'operador',
                'password': 'oper123',
                'is_staff': False,
                'area_asignada': areas[2] if len(areas) > 2 else None,
                'telefono': '555-0006'
            },
            {
                'username': 'viewer1',
                'email': 'viewer1@faparca.com',
                'first_name': 'Laura',
                'last_name': 'Sánchez',
                'rol': 'viewer',
                'password': 'view123',
                'is_staff': False,
                'area_asignada': None,
                'telefono': '555-0007'
            },
            {
                'username': 'viewer2',
                'email': 'viewer2@faparca.com',
                'first_name': 'Roberto',
                'last_name': 'Díaz',
                'rol': 'viewer',
                'password': 'view123',
                'is_staff': False,
                'area_asignada': None,
                'telefono': '555-0008'
            }
        ]

        for user_data in usuarios_data:
            password = user_data.pop('password')
            username = user_data['username']
            
            # Verificar si el usuario ya existe
            if Usuario.objects.filter(username=username).exists():
                self.stdout.write(f'  - Usuario existente: {username}')
                continue
            
            # Crear usuario
            user = Usuario.objects.create_user(
                username=username,
                password=password,
                **{k: v for k, v in user_data.items() if k != 'username'}
            )
            
            # Marcar como activo
            user.activo = True
            user.save()
            
            area_info = f" - Área: {user.area_asignada.nombre}" if user.area_asignada else ""
            self.stdout.write(
                self.style.SUCCESS(f'  ✓ Usuario creado: {username} ({user.get_rol_display()}){area_info}')
            )

    def print_credentials(self):
        """Imprime las credenciales de prueba"""
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.WARNING('CREDENCIALES DE PRUEBA:'))
        self.stdout.write('='*60)
        
        credentials = [
            ('ADMINISTRADOR', 'admin / admin123', 'Acceso total al sistema'),
            ('SUPERVISOR 1', 'supervisor1 / super123', 'Gestión de áreas'),
            ('SUPERVISOR 2', 'supervisor2 / super123', 'Gestión de áreas'),
            ('OPERADOR 1', 'operador1 / oper123', 'Registro de datos - Área 1'),
            ('OPERADOR 2', 'operador2 / oper123', 'Registro de datos - Área 2'),
            ('OPERADOR 3', 'operador3 / oper123', 'Registro de datos - Área 3'),
            ('VIEWER 1', 'viewer1 / view123', 'Solo lectura'),
            ('VIEWER 2', 'viewer2 / view123', 'Solo lectura'),
        ]
        
        for role, creds, desc in credentials:
            self.stdout.write(f'\n{role}:')
            self.stdout.write(f'  Usuario/Contraseña: {self.style.SUCCESS(creds)}')
            self.stdout.write(f'  Permisos: {desc}')
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.WARNING(
            '\n⚠️  IMPORTANTE: Cambia estas contraseñas en producción\n'
        ))
