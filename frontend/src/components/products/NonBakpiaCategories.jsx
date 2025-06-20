import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Non-Bakpia Categories component
 * Displays tabs for non-bakpia product categories
 */
export default function NonBakpiaCategories({ categories, onSelectCategory }) {
  const [activeCategory, setActiveCategory] = useState(null);

  // Filter only non-bakpia categories (ids 5-9)
  const nonBakpiaCategories = categories.filter(cat => cat.id >= 5);

  const handleCategoryClick = (category) => {
    setActiveCategory(category.id);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  if (nonBakpiaCategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Produk Non Bakpia</h2>
      <div className="flex border-b space-x-1 overflow-x-auto no-scrollbar">
        {nonBakpiaCategories.map(category => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors focus:outline-none",
              activeCategory === category.id
                ? "border-green-500 text-green-600" 
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
