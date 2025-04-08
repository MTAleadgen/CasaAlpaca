/*
This client component provides the footer for the app.
*/

export default function Footer() {
  return (
    <footer className="mt-auto border-t py-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
