import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { MagnifyingGlassIcon } from '../constants';
import type { CoffeeOption } from '../types';

// Initialize the Gemini API client.
// Ensure that the API key is available as an environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const coffeeMenu: CoffeeOption[] = [
    { id: 1, name: 'Brewed Coffee', description: 'Simple, classic, and pure.', healthIndex: 10, image: 'https://picsum.photos/id/225/200/200', price: 2.50 },
    { id: 2, name: 'Caffè Americano', description: 'Espresso shots topped with hot water.', healthIndex: 9, image: 'https://picsum.photos/id/305/200/200', price: 3.00 },
    { id: 3, name: 'Iced Coffee (Unsweetened)', description: 'Chilled coffee over ice.', healthIndex: 8, image: 'https://picsum.photos/id/326/200/200', price: 3.25 },
    { id: 4, name: 'Caffè Latte', description: 'Rich espresso with steamed milk.', healthIndex: 7, image: 'https://picsum.photos/id/431/200/200', price: 4.00 },
    { id: 5, name: 'Cappuccino', description: 'Espresso with a deep layer of frothed milk foam.', healthIndex: 7, image: 'https://picsum.photos/id/488/200/200', price: 4.00 },
    { id: 6, name: 'Flat White', description: 'Espresso with steamed milk, no foam.', healthIndex: 6, image: 'https://picsum.photos/id/490/200/200', price: 4.25 },
    { id: 7, name: 'Caramel Macchiato', description: 'Espresso, vanilla syrup, milk, and caramel drizzle.', healthIndex: 4, image: 'https://picsum.photos/id/234/200/200', price: 4.75 },
    { id: 8, name: 'White Chocolate Mocha', description: 'Espresso, white chocolate sauce, milk, and whipped cream.', healthIndex: 3, image: 'https://picsum.photos/id/312/200/200', price: 5.00 },
    { id: 9, name: 'Java Chip Frappuccino', description: 'Blended coffee, milk, mocha sauce, and chocolate chips.', healthIndex: 2, image: 'https://picsum.photos/id/367/200/200', price: 5.25 },
];

const getHealthIndexColor = (index: number) => {
    if (index >= 8) return 'bg-cafa-eco text-white';
    if (index >= 4) return 'bg-cafa-accent text-white';
    return 'bg-red-500 text-white';
};

interface StoresScreenProps {
    addToCart: (coffee: CoffeeOption) => void;
}

const StoresScreen: React.FC<StoresScreenProps> = ({ addToCart }) => {
    const [selectedCoffeeId, setSelectedCoffeeId] = useState<number | null>(null);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const handleCoffeeSelect = useCallback(async (coffee: CoffeeOption) => {
        if (selectedCoffeeId === coffee.id) {
            setSelectedCoffeeId(null);
            setIngredients([]);
            return;
        }

        setSelectedCoffeeId(coffee.id);
        setIsLoading(true);
        setError(null);
        setIngredients([]);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `List the typical ingredients for a "${coffee.name}".`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            ingredients: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING
                                }
                            }
                        }
                    }
                }
            });
            
            const jsonStr = response.text.trim();
            const parsed = JSON.parse(jsonStr);
            setIngredients(parsed.ingredients || []);

        } catch (e) {
            console.error(e);
            setError('Could not fetch ingredients. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedCoffeeId]);

    const filteredCoffeeMenu = coffeeMenu.filter(coffee =>
        coffee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coffee.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 space-y-4">
            <header>
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-cafa-text-primary">Coffee Menu & Health Index</h1>
                        <p className="text-sm text-cafa-text-secondary mt-1">Explore our coffee options. Healthier choices have a higher score (up to 10).</p>
                    </div>
                    <button 
                        onClick={() => setIsSearchVisible(prev => !prev)}
                        className="p-2 -mr-2 text-cafa-text-secondary hover:text-cafa-primary transition-colors"
                        aria-label="Toggle search bar"
                        aria-expanded={isSearchVisible}
                    >
                        <MagnifyingGlassIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {isSearchVisible && (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for coffee..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cafa-accent"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-4">
                {filteredCoffeeMenu.map((coffee) => (
                    <div key={coffee.id} className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                        <button onClick={() => handleCoffeeSelect(coffee)} className="w-full p-4 flex items-center gap-4 text-left" aria-expanded={selectedCoffeeId === coffee.id} aria-controls={`ingredients-${coffee.id}`}>
                            <img src={coffee.image} alt={coffee.name} className="w-16 h-16 rounded-xl object-cover" />
                            <div className="flex-1">
                                <h3 className="font-bold text-cafa-text-primary">{coffee.name}</h3>
                                <p className="text-sm text-cafa-text-secondary">{coffee.description}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getHealthIndexColor(coffee.healthIndex)} flex-shrink-0`}>
                                {coffee.healthIndex}
                            </div>
                        </button>

                        {selectedCoffeeId === coffee.id && (
                            <div id={`ingredients-${coffee.id}`} className="px-4 pb-4 pt-2 border-t border-gray-100">
                                {isLoading && (
                                    <div className="flex justify-center items-center h-24">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cafa-primary"></div>
                                    </div>
                                )}
                                {error && <p className="text-sm text-center text-red-500 py-4">{error}</p>}
                                {!isLoading && ingredients.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-sm mb-2 text-cafa-text-primary">Ingredients:</h4>
                                        <ul className="list-disc list-inside text-sm text-cafa-text-secondary space-y-1">
                                            {ingredients.map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                        <button 
                                            onClick={() => addToCart(coffee)}
                                            className="w-full bg-cafa-primary text-white font-bold py-2.5 px-3 rounded-lg text-sm mt-4 hover:bg-cafa-primary/90 transition-colors">
                                            Add to Cart
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoresScreen;