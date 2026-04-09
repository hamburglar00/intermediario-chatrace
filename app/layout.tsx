export const metadata = {
  title: "intermediario-chatrace",
  description: "Intermediario para Chatrace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
