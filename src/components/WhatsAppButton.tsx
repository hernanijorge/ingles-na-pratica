export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  const href = `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Olá! Quero saber mais sobre o Descomplica English.",
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.374 3 4 8.374 4 15.004c0 2.393.666 4.703 1.93 6.715L4 29l7.46-1.906a11.96 11.96 0 0 0 4.544.886h.005c6.63 0 12.004-5.374 12.004-12.004C28.013 8.374 22.638 3 16.004 3Zm0 21.84a9.8 9.8 0 0 1-5.002-1.37l-.358-.213-4.43 1.131 1.182-4.316-.233-.372a9.78 9.78 0 0 1-1.5-5.196c0-5.42 4.407-9.828 9.845-9.828 5.42 0 9.828 4.407 9.828 9.828 0 5.42-4.41 9.836-9.832 9.836Zm5.4-7.37c-.297-.148-1.757-.867-2.028-.966-.272-.1-.47-.148-.667.148-.198.297-.766.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.253-.462-2.387-1.474-.883-.787-1.48-1.76-1.653-2.057-.173-.297-.019-.457.13-.605.149-.148.347-.396.52-.594.174-.198.232-.34.348-.569.116-.228.058-.421-.04-.569-.098-.148-.52-1.25-.712-1.712-.19-.46-.384-.397-.527-.405l-.45-.008c-.148 0-.396.057-.594.272-.198.223-.767.75-.767 1.83 0 1.08.79 2.122.9 2.27.11.149 1.53 2.33 3.71 3.17 2.179.84 2.179.56 2.57.525.39-.034 1.26-.513 1.436-1.01.173-.496.173-.92.124-1.01-.049-.09-.247-.149-.544-.297Z" />
      </svg>
    </a>
  );
}
