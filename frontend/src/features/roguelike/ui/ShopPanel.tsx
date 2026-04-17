import { ShopOffer } from '../domain/types';

export const ShopPanel = ({
  offers,
  gold,
  canAfford,
  onBuy,
  onLeave
}: {
  offers: ShopOffer[];
  gold: number;
  canAfford: (offer: ShopOffer, gold: number) => boolean;
  onBuy: (offerId: string) => void;
  onLeave: () => void;
}) => (
  <section className="dungeon-panel">
    <h2>Лавка</h2>
    <p>Ваше золото: {gold}</p>
    <div className="dungeon-room-grid">
      {offers.map((offer) => (
        <button
          key={offer.id}
          type="button"
          className="dungeon-room-card"
          disabled={!canAfford(offer, gold)}
          onClick={() => onBuy(offer.id)}
        >
          <h3>{offer.label}</h3>
          <p>{offer.description}</p>
          <small>Цена: {offer.costGold}</small>
        </button>
      ))}
    </div>
    <button type="button" onClick={onLeave}>Выйти из магазина</button>
  </section>
);
