import type { Banner, SelectedPlan, Zone, Prices } from '../types';
import Hero             from '../components/Hero';
import CoverageChecker  from '../components/CoverageChecker';
import { FibraPlans, WirelessPlans } from '../components/Plans';
import ServicesPromo    from '../components/ServicesPromo';

interface Props {
  prices: Prices;
  banners: Banner[];
  zone: Zone;
  prefillAddr: string;
  setZone: (zone: Zone) => void;
  setPrefill: (addr: string) => void;
  handleSelect: (plan: SelectedPlan) => void;
}

export default function HomePage({
  prices,
  banners,
  zone,
  setZone,
  setPrefill,
  handleSelect,
}: Props) {
  return (
    <>
      <Hero banners={banners} />
      <CoverageChecker
        onZoneDetected={setZone}
        onAddressFound={setPrefill}
      />
      <FibraPlans prices={prices} onSelect={handleSelect} zone={zone} />
      <WirelessPlans prices={prices} onSelect={handleSelect} zone={zone} />
      <ServicesPromo />
    </>
  );
}
