'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';
import api from '@/lib/api';
import NotificationCenter from '@/components/dashboard/NotificationCenter';

	const navSections = [
	{
		label: 'Main',
		items: [
			{ icon: '🏠', label: 'Dashboard', href: '/parent' },
			{ icon: '🎓', label: 'Scholarships', href: '/parent/scholarships' },
			{ icon: '🏛️', label: 'Govt. Schemes', href: '/parent/schemes' },
			{ icon: '🏆', label: 'Competitions', href: '/parent/competitions' },
			{ icon: '🎯', label: 'Competitive Exams', href: '/parent/competitive-exams' },
		{ icon: '🏫', label: 'Schools', href: '/parent/schools' },
		{ icon: '🎓', label: 'Institutions', href: '/parent/institutions' },
		{ icon: '🎪', label: 'Events', href: '/parent/events' },
			{ icon: '⭐', label: 'Notable', href: '/parent/notable' },
			{ icon: '🏪', label: 'Service Provider', href: '/parent/service-providers' },
		],
	},
	{
		label: 'Tracking',
		items: [
			{
				icon: '📌',
				label: 'Application Status',
				href: '/parent/application-status',
			},
			{ icon: '🗂️', label: 'Files & Folders', href: '/parent/files-folders' },
			{ icon: '🏆', label: 'Results', href: '/parent/results' },
			{ icon: '📰', label: 'History', href: '/parent/history' },
		],
	},
	{
		label: 'Activity',
		items: [
			{ icon: '🛠️', label: 'Support Center', href: '/parent/services' },
			{ icon: '🔔', label: 'Notifications', href: '/parent/notifications' },
			{ icon: '❓', label: 'FAQ\'s', href: '/parent/faqs' },
		],
	},
	{
		label: 'Account',
		items: [
			{ icon: '👤', label: 'My Profile', href: '/parent/profile' },
			{ icon: '⚙️', label: 'Settings', href: '/parent/settings' },
		],
	},
];

export default function ParentLayout({ children }) {
	const pathname = usePathname();
	const router = useRouter();
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await api.getMe();
				if (res.user && res.user.role === 'parent') {
					setUser(res.user);
				} else if (res.user) {
					// Wrong role — redirect to correct dashboard
					if (res.user.role === 'student') router.push('/dashboard');
					else if (['school', 'university'].includes(res.user.role))
						router.push('/institution');
					else router.push('/auth');
				} else {
					router.push('/auth');
				}
			} catch (err) {
				router.push('/auth');
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [router]);

	const isActive = (href) => {
		if (href === '/parent') return pathname === '/parent';
		return pathname.startsWith(href);
	};

	if (loading)
		return (
			<div
				style={{
					display: 'flex',
					height: '100vh',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'var(--bg-primary)',
				}}
			>
				<div className={styles.orb}></div>
			</div>
		);

	return (
		<div className={styles.dashboardLayout}>
			{/* Sidebar Overlay for Mobile */}
			<div
				className={`${styles.mobileOverlay} ${mobileOpen ? styles.show : ''}`}
				onClick={() => setMobileOpen(false)}
			/>

			{/* Floating Glass Sidebar */}
			<aside
				className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${
					mobileOpen ? styles.mobileOpen : ''
				}`}
			>
				<div className={styles.sidebarInner}>
					{/* Logo Section */}
					<div className={styles.sidebarLogo}>
						<div className={styles.sLogoIcon}>🛡️</div>
						<div className={styles.sLogoText}>
							Kusha<span>agra</span>
						</div>
					</div>

					{/* Navigation Links */}
					<nav className={styles.sidebarNav}>
						{navSections.map((section) => (
							<div key={section.label} className={styles.navSection}>
								<div className={styles.navSectionLabel}>{section.label}</div>
								{section.items.map((item) => (
									<a
										key={item.href}
										href={item.href}
										className={`${styles.navItem} ${
											isActive(item.href) ? styles.active : ''
										}`}
										onClick={(e) => {
											e.preventDefault();
											router.push(item.href);
											setMobileOpen(false);
										}}
									>
										<span className={styles.navIcon}>{item.icon}</span>
										<span className={styles.navLabel}>{item.label}</span>
									</a>
								))}
							</div>
						))}
					</nav>

					{/* Sidebar Action Footer */}
					<div className={styles.sidebarFooter}>
						<button
							className={styles.logoutBtn}
							onClick={() => api.logout()}
						>
							<span className={styles.logoutIcon}>🚪</span>
							<span className={styles.logoutLabel}>Logout</span>
						</button>
						<button
							className={styles.collapseBtn}
							onClick={() => setCollapsed(!collapsed)}
						>
							{collapsed ? '→' : '← Collapse Panel'}
						</button>
					</div>
				</div>
			</aside>

			<div
				className={`${styles.mobileOverlay} ${mobileOpen ? styles.show : ''}`}
				onClick={() => setMobileOpen(false)}
			/>

			<div className={styles.mainContent}>
				<header className={styles.topbar}>
					<button
						className={styles.mobileMenuBtn}
						onClick={() => setMobileOpen(true)}
					>
						☰
					</button>
					<div className={styles.searchWrap}>
						<span className={styles.searchIcon}>🔍</span>
						<input
							type="text"
							className={styles.searchInput}
							placeholder="Search schools, schemes..."
						/>
					</div>
					<div className={styles.topbarRight}>
						<NotificationCenter />
						<div
							className={styles.userAvatar}
							onClick={() => router.push('/parent/profile')}
						>
							<div className={styles.avatarCircle}>
								{user?.profile?.avatar ? (
									<img
										src={api.getImageUrl(user.profile.avatar)}
										alt="Parent"
										style={{
											width: '100%',
											height: '100%',
											borderRadius: '50%',
											objectFit: 'cover',
										}}
									/>
								) : (
									'👨‍👩‍👧'
								)}
							</div>
							<div>
								<div className={styles.userName}>
									{user?.profile?.firstName} {user?.profile?.lastName}
								</div>
								<div className={styles.userGrade}>
									Parent •{' '}
									{user?.parentProfile?.children?.length || 0} Children
								</div>
							</div>
						</div>
					</div>
				</header>

				<div className={styles.pageContent}>{children}</div>
			</div>
		</div>
	);
}