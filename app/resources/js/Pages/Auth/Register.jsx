import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { usePage } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const theme = usePage().props.theme || 'light';

    const submit = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Регистрация" />

            <div className="auth-header">
                <div className="auth-logo">
                    <ApplicationLogo
                        className={`h-12 w-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    />
                </div>
            </div>

            <form onSubmit={submit}>
                <div className="auth-input-group">
                    <label htmlFor="name" className="auth-label">
                        Имя
                    </label>
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        className="auth-input"
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Введите ваше имя"
                        required
                    />
                    {errors.name && (
                        <div className="auth-error">{errors.name}</div>
                    )}
                </div>

                <div className="auth-input-group">
                    <label htmlFor="email" className="auth-label">
                        Электронная почта
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="auth-input"
                        autoComplete="email"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                    />
                    {errors.email && (
                        <div className="auth-error">{errors.email}</div>
                    )}
                </div>

                <div className="auth-input-group">
                    <label htmlFor="password" className="auth-label">
                        Пароль
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="auth-input"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Придумайте пароль"
                        required
                    />
                    {errors.password && (
                        <div className="auth-error">{errors.password}</div>
                    )}
                </div>

                <div className="auth-input-group">
                    <label htmlFor="password_confirmation" className="auth-label">
                        Подтверждение пароля
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="auth-input"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Повторите пароль"
                        required
                    />
                    {errors.password_confirmation && (
                        <div className="auth-error">{errors.password_confirmation}</div>
                    )}
                </div>

                <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={processing}
                >
                    {processing ? 'Регистрация...' : 'Создать аккаунт'}
                </button>

                <div className="auth-links">
                    <Link
                        href={route('login')}
                        className="auth-secondary-btn"
                    >
                        Войти
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
