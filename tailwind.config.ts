import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['"Plus Jakarta Sans"', '"Noto Sans Bengali"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				display: ['"Plus Jakarta Sans"', '"Noto Sans Bengali"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
			fontSize: { '3xl': ['36px', { lineHeight: '40px' }] },
            spacing: { 'design-1': '4px', 'design-2': '6px', 'design-3': '8px', 'design-4': '10px', 'design-5': '16px', 'design-6': '20px', 'design-7': '24px' },
            // Astryx motion: fast 125ms, medium 300ms, slow 700ms; entrance easing as the default curve
            transitionDuration: { instant: '125ms', fast: '300ms', DEFAULT: '125ms', slow: '700ms' },
            transitionTimingFunction: { DEFAULT: 'cubic-bezier(0.24, 1, 0.4, 1)', entrance: 'cubic-bezier(0.24, 1, 0.4, 1)', exit: 'cubic-bezier(0.3, 0, 0.6, 0.6)' },
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				paper: 'hsl(var(--paper))',
				panel: {
					DEFAULT: 'hsl(var(--panel))',
					2: 'hsl(var(--panel-2))'
				},
				series: {
					web: 'hsl(var(--series-web))',
					data: 'hsl(var(--series-data))',
					career: 'hsl(var(--series-career))',
					webinar: 'hsl(var(--series-webinar))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					soft: 'hsl(var(--success-soft))',
					strong: 'hsl(var(--success-strong))',
					'strong-foreground': 'hsl(var(--success-strong-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					soft: 'hsl(var(--warning-soft))'
				},
				danger: {
					DEFAULT: 'hsl(var(--danger))',
					foreground: 'hsl(var(--danger-foreground))',
					soft: 'hsl(var(--danger-soft))',
					strong: 'hsl(var(--danger-strong))',
					'strong-foreground': 'hsl(var(--danger-strong-foreground))'
				},
				scan: 'hsl(var(--surface-scan))',
				scrim: 'hsl(var(--scrim))',
				brand: {
                    blue: 'hsl(var(--brand-blue))',
                    'blue-hover': 'hsl(var(--brand-blue-hover))',
                    indigo: 'hsl(var(--brand-indigo))',
                    purple: 'hsl(var(--brand-purple))',
                    surface: 'hsl(var(--brand-surface))',
                    border: 'hsl(var(--brand-border))',
					bkash: {
						DEFAULT: 'hsl(var(--brand-bkash))',
						foreground: 'hsl(var(--brand-bkash-foreground))',
						soft: 'hsl(var(--brand-bkash-soft))',
						'soft-foreground': 'hsl(var(--brand-bkash-soft-foreground))'
					},
					nagad: {
						DEFAULT: 'hsl(var(--brand-nagad))',
						foreground: 'hsl(var(--brand-nagad-foreground))',
						soft: 'hsl(var(--brand-nagad-soft))',
						'soft-foreground': 'hsl(var(--brand-nagad-soft-foreground))'
					},
					whatsapp: {
						DEFAULT: 'hsl(var(--brand-whatsapp))',
						hover: 'hsl(var(--brand-whatsapp-hover))',
						foreground: 'hsl(var(--brand-whatsapp-foreground))'
					},
					telegram: {
						DEFAULT: 'hsl(var(--brand-telegram))',
						hover: 'hsl(var(--brand-telegram-hover))',
						foreground: 'hsl(var(--brand-telegram-foreground))'
					},
					linkedin: {
						DEFAULT: 'hsl(var(--brand-linkedin))',
						foreground: 'hsl(var(--brand-linkedin-foreground))'
					}
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsla(var(--sidebar-background), 0.9)',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			// Astryx radius scale: inner 6px, element 10px (--radius), container 12px, page 28px
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: '0.375rem',
				xl: '0.75rem',
				'2xl': '0.75rem',
				'3xl': '1.75rem',
                full: '9999px'
			},
			backgroundImage: {
                'brand-gradient': 'var(--brand-gradient)',
                'brand-grid': 'var(--brand-grid)',
			},
			boxShadow: {
                brand: 'var(--shadow-brand)',
				'card': 'var(--shadow-card)',
				'hover': 'var(--shadow-hover)',
				'pop': 'var(--shadow-pop)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-up': 'slide-up 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
