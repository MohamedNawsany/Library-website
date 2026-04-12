'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type PositionConfig = {
  name: string;
  image: string;
  textPos: string;
  colSpan: string;
  rowSpan: string;
  height: string;
};

const positions: PositionConfig[] = [
  {
    name: 'Art',
    image: '/Art.jpg',
    textPos: 'left-0 top-1/2 -translate-y-1/2 -rotate-90',
    colSpan: 'col-span-1',
    rowSpan: 'row-span-2',
    height: 'h-[500px]',
  },
  {
    name: 'Religion',
    image: '/Religion.jpg',
    textPos: 'top-4 left-4',
    colSpan: 'col-span-1',
    rowSpan: 'row-span-1',
    height: 'h-[240px]',
  },
  {
    name: 'Science',
    image: '/sciense.jpg',
    textPos: 'top-4 right-4',
    colSpan: 'col-span-1',
    rowSpan: 'row-span-1',
    height: 'h-[240px]',
  },
  {
    name: 'History',
    image: '/History.jpg',
    textPos: 'bottom-4 left-4',
    colSpan: 'col-span-2',
    rowSpan: 'row-span-1',
    height: 'h-[240px]',
  },
  {
    name: 'Adventure fiction',
    image: '/Mystery.jpg',
    textPos: 'top-4 left-4',
    colSpan: 'col-span-2',
    rowSpan: 'row-span-1',
    height: 'h-[250px]',
  },
  {
    name: 'Inspirational',
    image: '/Inspirational.jpg',
    textPos: 'bottom-4 right-4',
    colSpan: 'col-span-1',
    rowSpan: 'row-span-1',
    height: 'h-[240px]',
  },
];

function CategoryTile({
  cat,
  simple,
}: {
  cat: PositionConfig;
  simple?: boolean;
}) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/books?category=${encodeURIComponent(cat.name)}`);
  };

  if (simple) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="relative h-48 w-full overflow-hidden rounded-2xl shadow-lg transition hover:shadow-xl sm:h-56"
      >
        <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <h3 className="absolute bottom-4 left-4 right-4 text-left text-2xl font-bold text-[#FFEFD5] drop-shadow-lg">
          {cat.name}
        </h3>
      </button>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg transition duration-500 hover:shadow-[0_0_25px_5px_rgba(105,105,105,0.6)] ${cat.colSpan} ${cat.rowSpan} ${cat.height}`}
    >
      <Image
        src={cat.image}
        alt={cat.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <h3
        className={`absolute text-2xl font-bold text-[#FFEFD5] drop-shadow-lg transition-all duration-500 group-hover:-translate-y-2 sm:text-3xl ${cat.textPos}`}
      >
        {cat.name}
      </h3>
    </div>
  );
}

export default function Categories() {
  return (
    <section className="w-full bg-[#f0ebfe] py-8 sm:py-12">
      <div className="w-full px-5 sm:px-6">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 sm:mb-8 sm:text-3xl">Browse by category</h2>

        {/* Mobile / small tablets: stacked cards */}
        <div className="flex flex-col gap-4 md:hidden">
          {positions.map((cat) => (
            <CategoryTile key={cat.name} cat={cat} simple />
          ))}
        </div>

        {/* md+: original mosaic */}
        <div className="hidden grid-cols-3 grid-rows-2 gap-4 sm:gap-6 md:grid">
          {positions.map((cat) => (
            <CategoryTile key={cat.name} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
