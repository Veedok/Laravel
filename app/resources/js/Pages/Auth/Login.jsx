import { Head, Link, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const { props } = usePage();
    const theme = props.theme || 'light';

    console.log('Form errors:', errors);
    console.log('Page errors:', props.errors);

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Вход в систему" />

            <div className="auth-header">
                <div className="auth-logo">
                    <ApplicationLogo
                        className={`h-12 w-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    />
                </div>
            </div>

            {/* Общие ошибки из flash */}
            {props.flash?.error && (
                <div className="auth-error-message">
                    {props.flash.error}
                </div>
            )}

            {status && (
                <div className="status-success">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
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
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="your@email.com"
                    />
                    {/* Ошибки email из формы ИЛИ из сессии */}
                    {(errors.email || props.errors?.email) && (
                        <div className="auth-error">
                            {errors.email || props.errors?.email}
                        </div>
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
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Введите ваш пароль"
                    />
                    {/* Ошибки password */}
                    {errors.password && (
                        <div className="auth-error">{errors.password}</div>
                    )}
                </div>

                <div className="auth-remember">
                    <input
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="auth-checkbox"
                    />
                    <label className="auth-remember-label">
                        Запомнить меня
                    </label>
                </div>

                <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={processing}
                >
                    {processing ? 'Вход...' : 'Войти в систему'}
                </button>

                <div className="auth-links">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="auth-link"
                        >
                            Забыли пароль?
                        </Link>
                    )}

                    <Link
                        href={route('register')}
                        className="auth-secondary-btn"
                    >
                        Создать аккаунт
                    </Link>
                    <Link
                        href={route('aboutUs')}
                        className="auth-secondary-btn"
                    >
                        О нас
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
