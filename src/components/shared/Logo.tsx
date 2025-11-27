import Image from "next/image";

export default function Logo() {
  return (
    <span className="relative inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white">
      <Image
        src="/logo.jpg"
        alt="citymuscattours logo"
        width={56}
        height={56}
        className="h-full w-full object-cover"
        priority
      />
      <span className="sr-only">citymuscattours</span>
    </span>
  );
}

