export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <article className="max-w-xl mx-auto mt-20">{children}</article>
  );
}
