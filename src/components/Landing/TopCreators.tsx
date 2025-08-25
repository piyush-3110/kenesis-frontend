import CreatorCard from './CreatorCard';

const mockCreators = [
{ name: 'Alice Carter', totalSales: 24.5, avatar: '/images/landing/avatar1.png', rank: 1 },
  { name: 'Sophie Lee', totalSales: 22.1, avatar: '/images/landing/avatar2.png', rank: 2 },
  { name: 'Emma Rose', totalSales: 18.7, avatar: '/images/landing/avatar3.png', rank: 3 },
  { name: 'Lily Brown', totalSales: 17.9, avatar: '/images/landing/avatar1.png', rank: 4 },
  { name: 'Zoe Adams', totalSales: 14.2, avatar: '/images/landing/avatar2.png', rank: 5 },
  { name: 'Olivia Stone', totalSales: 11.5, avatar: '/images/landing/avatar3.png', rank: 6 },
  { name: 'Mia Khan', totalSales: 9.3, avatar: '/images/landing/avatar1.png', rank: 7 },
  { name: 'Ava Smith', totalSales: 8.7, avatar: '/images/landing/avatar2.png', rank: 8 },

];

// Sort by sales
const sortedCreators = mockCreators.sort((a, b) => b.totalSales - a.totalSales);

const TopCreators = () => {
  return (
    <section className="px-4 py-20 max-w-7xl mx-auto text-center">
      {/* Heading */}
      <h2 className="font-poppins font-semibold text-[32px] sm:text-[36px] md:text-[38px] leading-[120%] capitalize text-white mb-2">
        Top Creators
      </h2>

      {/* Subheading */}
      <p className="font-poppins font-normal text-[18px] sm:text-[20px] md:text-[22px] leading-[160%] capitalize text-white mb-12">
        Checkout Top Rated Creators on the Kenesis Marketplace.
      </p>

      {/* Creator Cards */}
      <div className="grid grid-cols-1 mx-auto md:grid-cols-2 lg:px-24 lg:grid-cols-4 place-items-center gap-12">
        {sortedCreators.map((creator, index) => (
          <CreatorCard
            key={index}
            name={creator.name}
            totalSales={creator.totalSales}
            avatar={creator.avatar}
            rank ={creator.rank}
          />
        ))}
      </div>
    </section>
  );
};

export default TopCreators;
