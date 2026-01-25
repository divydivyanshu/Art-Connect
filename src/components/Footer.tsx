import Link from "next/link";

export function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <div className="footer-logo">🎨 ArtConnect</div>
                        <p className="footer-description">
                            Connect with talented artists for custom portraits, paintings, and digital art.
                            Bring your vision to life with verified creative professionals.
                        </p>
                    </div>

                    <div>
                        <h4 className="footer-title">For Buyers</h4>
                        <ul className="footer-links">
                            <li><Link href="/artists">Browse Artists</Link></li>
                            <li><Link href="/user/signup">Sign Up</Link></li>
                            <li><Link href="/user/login">Login</Link></li>
                            <li><Link href="/user/dashboard">My Orders</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">For Artists</h4>
                        <ul className="footer-links">
                            <li><Link href="/become-artist">Become an Artist</Link></li>
                            <li><Link href="/artist/login">Artist Login</Link></li>
                            <li><Link href="/artist/dashboard">Artist Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Support</h4>
                        <ul className="footer-links">
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2024 ArtConnect. All rights reserved. Made with ❤️ for artists and art lovers.</p>
                </div>
            </div>
        </footer>
    );
}
