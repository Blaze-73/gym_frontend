const Forbidden = () => (
  <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-9xl font-black text-error">403</h1>
      <p className="text-white font-headline uppercase tracking-widest mt-4">Access Denied</p>
      <p className="text-gray-500 mt-2">You do not have the required clearance for this sector.</p>
      <Link to="/" className="mt-8 inline-block px-6 py-3 bg-primary-fixed text-black font-bold rounded-full">Return to Base</Link>
    </div>
  </div>
);
export default Forbidden;
