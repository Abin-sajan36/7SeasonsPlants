const fs = require('fs');
let code = fs.readFileSync('src/components/home/FeaturedCombosSection.tsx', 'utf8');

const target = `export const FeaturedCombosSection: React.FC<FeaturedCombosSectionProps> = ({ onNavigate }) => {
  const { combos } = useStore();
  const featuredCombos = combos.filter((c) => c.status === 'published').slice(0, 3);
  return (`;

const replacement = `export const FeaturedCombosSection: React.FC<FeaturedCombosSectionProps> = ({ onNavigate }) => {
  const { combos, selectedDeliveryState } = useStore();
  
  const featuredCombos = combos.filter((c) => {
    if (c.status !== 'published') return false;
    
    if (selectedDeliveryState) {
      if (c.sellableStates && c.sellableStates.length > 0 && !c.sellableStates.includes(selectedDeliveryState)) {
        return false;
      }
    }
    return true;
  }).slice(0, 3);

  return (`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/home/FeaturedCombosSection.tsx', code);
