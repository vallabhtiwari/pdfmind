export function Navbar() {
  return (
    <nav className="flex justify-between items-center">
      <div className="w-1/2 bg-amber-300 p-4">PDFMind</div>
      <div className="w-1/2 flex bg-pink-600 justify-end gap-72 p-4">
        <div>Upload</div>
        <div>User</div>
      </div>
    </nav>
  );
}
