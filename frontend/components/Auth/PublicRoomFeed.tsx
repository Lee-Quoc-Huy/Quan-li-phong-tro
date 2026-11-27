import { useState } from 'react';
import { Building2, ChevronLeft, ChevronRight, Image, Ruler, Search, SlidersHorizontal } from 'lucide-react';
import type { PublicRoomListing } from '../../types';

const demoRoom: PublicRoomListing = {
  id: 'demo',
  roomNumber: 'Phòng studio',
  houseName: 'Dãy trọ mẫu',
  areaM2: 22,
  basePrice: 2800000,
};

const formatPrice = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});
const formatArea = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const illustrationUrl = `${import.meta.env.BASE_URL}assets/phong-tro-minh-hoa.webp`;
const priceBands = [
  { label: 'Mọi mức giá', min: 0, max: Infinity },
  { label: 'Dưới 2 triệu', min: 0, max: 2_000_000 },
  { label: '2 đến dưới 4 triệu', min: 2_000_000, max: 4_000_000 },
  { label: '4 đến dưới 6 triệu', min: 4_000_000, max: 6_000_000 },
  { label: 'Từ 6 triệu', min: 6_000_000, max: Infinity },
];
const defaultFilters = { query: '', priceBand: 0, minArea: 0, withPhotos: false };
const controlClass = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700';

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');
}

function findMatchingRooms(listings: PublicRoomListing[], filters: typeof defaultFilters, sort: string) {
  const words = normalizeSearch(filters.query.trim()).split(/\s+/).filter(Boolean);
  const band = priceBands[filters.priceBand];
  const matches = listings.filter((room) => {
    const name = normalizeSearch(`${room.roomNumber} ${room.houseName ?? ''}`);
    return words.every((word) => name.includes(word))
      && (!filters.priceBand || (room.basePrice > 0 && room.basePrice >= band.min && room.basePrice < band.max))
      && (!filters.minArea || room.areaM2 >= filters.minArea)
      && (!filters.withPhotos || Boolean(room.imageUrls?.length));
  });

  if (sort === 'area') return matches.sort((a, b) => (b.areaM2 || 0) - (a.areaM2 || 0));
  if (sort === 'price-asc' || sort === 'price-desc') {
    return matches.sort((a, b) => {
      if (!(a.basePrice > 0)) return b.basePrice > 0 ? 1 : 0;
      if (!(b.basePrice > 0)) return -1;
      return sort === 'price-asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice;
    });
  }
  return matches;
}

function RoomPhotoGallery({ room }: { room: PublicRoomListing }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const urls = room.imageUrls ?? [];
  const index = selectedIndex < urls.length ? selectedIndex : 0;
  const url = urls[index];
  const isIllustration = !url || failedUrls.includes(url);

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-emerald-950/10">
      <img
        src={isIllustration ? illustrationUrl : url}
        alt={isIllustration ? '' : `Ảnh ${index + 1} của ${room.roomNumber}`}
        loading="lazy"
        onError={isIllustration ? undefined : () => setFailedUrls((previous) => [...previous, url])}
        className="size-full object-cover"
      />
      {isIllustration && (
        <span className="absolute bottom-2.5 right-2.5 rounded-md bg-slate-950/90 px-2 py-1 text-xs text-white">
          Ảnh minh họa
        </span>
      )}
      {urls.length > 1 && (
        <>
          <button
            type="button"
            aria-label={`Ảnh trước của ${room.roomNumber}`}
            onClick={() => setSelectedIndex((index + urls.length - 1) % urls.length)}
            className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-slate-950/80 text-white hover:bg-slate-950"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Ảnh tiếp theo của ${room.roomNumber}`}
            onClick={() => setSelectedIndex((index + 1) % urls.length)}
            className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-slate-950/80 text-white hover:bg-slate-950"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <span aria-live="polite" className="absolute bottom-2.5 left-2.5 rounded-md bg-slate-950/90 px-2 py-1 text-xs text-white">
            Ảnh {index + 1}/{urls.length}
          </span>
        </>
      )}
    </div>
  );
}

export function PublicRoomFeed({ listings, isLoading }: { listings: PublicRoomListing[]; isLoading: boolean }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [sort, setSort] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const filterCount = Number(Boolean(filters.priceBand)) + Number(Boolean(filters.minArea)) + Number(filters.withPhotos);
  const hasFilters = Boolean(filters.query.trim()) || filterCount > 0;
  const waitingForListings = isLoading && listings.length === 0;
  const isDemo = !isLoading && listings.length === 0 && !hasFilters;
  const matchingRooms = findMatchingRooms(listings, filters, sort);
  const visibleListings = isDemo ? [demoRoom] : matchingRooms;
  const resetFilters = () => setFilters(defaultFilters);

  return (
    <section aria-labelledby="public-room-feed-title" className="mx-auto w-full min-w-0 max-w-6xl">
      <header className="relative isolate overflow-hidden rounded-3xl bg-emerald-950 px-5 pb-12 pt-7 text-white sm:px-9 sm:pb-15 sm:pt-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-18 -top-52 -z-10 size-120 rounded-full bg-emerald-700/35 blur-[75px]" />
        <h1 id="public-room-feed-title" className="max-w-xl text-3xl font-bold tracking-tight sm:text-5xl">
          Tìm phòng trọ
        </h1>
        <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-emerald-100 sm:text-base">
          Xem phòng đang trống theo mức giá và diện tích bạn cần.
        </p>
      </header>

      <div role="search" aria-label="Tìm và lọc phòng" className="relative mx-2 -mt-5 space-y-3 rounded-2xl border border-emerald-950/10 bg-white p-2.5 shadow-sm sm:mx-5 sm:p-3">
        <div className="flex items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Tên phòng hoặc dãy trọ</span>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Tên phòng hoặc dãy trọ"
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              className={`${controlClass} pl-9`}
            />
          </label>
          <button
            type="button"
            aria-expanded={showFilters}
            aria-controls="public-room-filters"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-emerald-900 px-3.5 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Bộ lọc{filterCount > 0 && ` (${filterCount})`}
          </button>
        </div>
        <div id="public-room-filters" hidden={!showFilters}>
          <div className="grid gap-3 border-t border-slate-200 pt-3 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="block text-sm font-medium text-slate-700">Giá thuê / tháng</span>
              <select value={filters.priceBand} onChange={(event) => setFilters({ ...filters, priceBand: Number(event.target.value) })} className={controlClass}>
                {priceBands.map((band, index) => <option key={band.label} value={index}>{band.label}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-slate-700">Diện tích</span>
              <select value={filters.minArea} onChange={(event) => setFilters({ ...filters, minArea: Number(event.target.value) })} className={controlClass}>
                <option value={0}>Mọi diện tích</option>
                {[15, 20, 25, 30].map((area) => <option key={area} value={area}>Từ {area} m²</option>)}
              </select>
            </label>
            <label className="flex min-h-11 items-center gap-2.5 self-end rounded-xl border border-slate-300 px-3 text-sm text-slate-700">
              <input type="checkbox" checked={filters.withPhotos} onChange={(event) => setFilters({ ...filters, withPhotos: event.target.checked })} className="size-4 accent-emerald-800" />
              Chỉ phòng có ảnh thật
            </label>
          </div>
        </div>
      </div>

      <div className="mb-4 mt-7 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Phòng đang trống</h2>
          <p role="status" className="mt-1 text-sm text-slate-600">
            {waitingForListings ? 'Đang tải danh sách…' : `${matchingRooms.length} phòng`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasFilters && (
            <button type="button" onClick={resetFilters} className="min-h-11 rounded-lg px-2 text-sm font-semibold text-emerald-800 hover:underline">
              Xóa bộ lọc
            </button>
          )}
          <label>
            <span className="sr-only">Sắp xếp</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className={controlClass}>
              <option value="default">Sắp xếp mặc định</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="area">Diện tích lớn trước</option>
            </select>
          </label>
        </div>
      </div>

      {!waitingForListings && matchingRooms.length === 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-700">
          <Image size={20} className="shrink-0 text-emerald-800" aria-hidden="true" />
          {hasFilters ? 'Chưa có phòng khớp. Thử đổi từ khóa hoặc mở rộng bộ lọc.' : 'Hiện chưa có phòng trống. Tin mẫu bên dưới để bạn xem thử.'}
        </div>
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleListings.map((room) => (
          <li key={room.id} className="min-w-0 overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm">
            <RoomPhotoGallery room={room} />
            <div className="p-4">
              <h3 className="text-lg font-bold text-slate-900 [overflow-wrap:anywhere]">{room.roomNumber}</h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600 [overflow-wrap:anywhere]">
                <Building2 size={15} className="shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                {isDemo && 'Tin mẫu · '}{room.houseName || 'Dãy trọ'}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-slate-200 pt-3">
                <p className="text-base font-bold text-emerald-900">
                  {room.basePrice > 0
                    ? <>{formatPrice.format(room.basePrice)} <span className="text-xs font-medium text-slate-600">/ tháng</span></>
                    : 'Chưa có giá thuê'}
                </p>
                {room.areaM2 > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    <Ruler size={15} aria-hidden="true" /> {formatArea.format(room.areaM2)} m²
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
