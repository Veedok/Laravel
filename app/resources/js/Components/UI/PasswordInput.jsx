// resources/js/Components/UI/PasswordInput.jsx
import React, { useState } from 'react';

const PasswordInput = ({
                           value,
                           onChange,
                           placeholder,
                           className = '',
                           theme = 'light',
                           minLength,
                           autoFocus = false,
                           disabled = false
                       }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const baseClasses = `w-full p-2 border rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
        theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
    }`;

    // Иконка закрытого глаза
    const ClosedEyeIcon = () => (
        <svg
            className="w-5 h-5"
            viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet"
            fill="currentColor"
        >
            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none">
                <path d="M705 4233 c-46 -24 -66 -45 -86 -88 -21 -45 -24 -110 -8 -152 6 -15
                82 -100 170 -189 l160 -161 -88 -64 c-279 -206 -534 -464 -737 -746 -84 -117
                -107 -168 -114 -248 -9 -116 25 -187 191 -400 161 -207 355 -404 562 -570 196
                -158 542 -359 774 -449 335 -132 601 -185 961 -193 331 -7 576 24 867 110
                l111 34 239 -240 c242 -243 284 -276 351 -277 130 -1 228 144 178 264 -17 40
                -3332 3354 -3374 3373 -38 17 -122 15 -157 -4z m1027 -1380 l146 -148 -10 -68
                c-19 -129 20 -309 94 -435 42 -73 167 -198 240 -240 126 -74 306 -113 435 -94
                l68 10 148 -146 c81 -81 147 -150 147 -153 0 -10 -177 -66 -245 -78 -170 -29
                -332 -21 -490 24 -293 85 -535 288 -670 560 -103 209 -135 435 -94 670 12 68
                68 245 78 245 3 0 72 -66 153 -147z"/>
                <path d="M2234 4135 c-155 -20 -297 -49 -444 -92 -69 -20 -127 -38 -130 -40
                -2 -2 99 -107 224 -232 l229 -229 65 25 c163 61 343 84 502 63 253 -33 461
                -133 635 -305 302 -298 401 -738 255 -1136 l-28 -76 318 -318 318 -318 66 47
                c263 188 516 438 729 721 122 163 142 207 142 315 0 108 -20 152 -142 315
                -506 674 -1188 1107 -1955 1241 -134 23 -186 27 -413 30 -183 2 -293 -1 -371
                -11z"/>
                <path d="M2480 3254 c-19 -3 -42 -7 -50 -10 -9 -3 125 -144 395 -414 260 -260
                413 -406 419 -400 17 17 11 229 -8 300 -66 243 -252 434 -486 499 -75 21 -205
                33 -270 25z"/>
            </g>
        </svg>
    );

    // Иконка открытого глаза
    const OpenEyeIcon = () => (
        <svg
            className="w-5 h-5"
            viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet"
            fill="currentColor"
        >
            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none">
                <path d="M2404 4080 c-846 -49 -1644 -502 -2280 -1294 -166 -207 -166 -244 1
                -453 635 -793 1436 -1245 2286 -1292 961 -52 1870 402 2585 1293 166 207 166
                244 -1 453 -464 579 -1016 977 -1626 1172 -190 61 -419 105 -599 116 -196 11
                -238 12 -366 5z m368 -466 c287 -54 563 -250 713 -505 180 -308 199 -680 51
                -995 -58 -123 -114 -203 -209 -301 -535 -551 -1446 -383 -1756 324 -112 255
                -114 567 -5 833 105 259 334 485 595 588 198 78 396 96 611 56z"/>
                <path d="M2455 3130 c-163 -35 -307 -136 -389 -274 -61 -101 -81 -176 -80
                -296 0 -116 11 -163 57 -260 43 -89 167 -213 258 -257 321 -155 694 3 810 342
                33 97 34 249 2 350 -73 231 -285 392 -528 401 -49 2 -108 -1 -130 -6z"/>
            </g>
        </svg>
    );

    return (
        <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`${baseClasses} ${className} pr-10`}
                minLength={minLength}
                autoFocus={autoFocus}
                disabled={disabled}
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
                tabIndex={-1}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
                {showPassword ? <OpenEyeIcon /> : <ClosedEyeIcon />}
            </button>
        </div>
    );
};

export default PasswordInput;
