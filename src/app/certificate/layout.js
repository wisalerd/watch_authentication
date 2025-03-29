export const metadata = {
    title: 'Certificate Page',
    description: 'Details of the watch certificate.',
  };
  
  export default function CertificateLayout({ children }) {
    return (
        <div className="text-gray-900 min-h-screen flex flex-col items-center">
            <div className="w-full max-w-4xl">
            {children} {/* Render Children Pages */}
            </div>
        </div>
    );
  }
  