export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border px-4 py-3 sm:px-6 text-primary">
      <p className="m-0 text-sm text-center">
        &copy; {year} Laxman K R. All rights reserved.
      </p>
    </footer>
  )
}
