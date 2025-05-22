import './globals.css'

export const metadata = {
  title: 'Email Priority Dashboard',
  description: 'Monitor email priorities from AI agent',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}