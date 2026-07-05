import CartItem from "../../components/ui/CartItem";

function Home() {
  return (
    <div>
      Home
      <CartItem
        img="/src/assets/ui/sampleImg.png"
        name="Bare Lace 13X6 Wig Lacefrontal"
        oldPrice={19.99}
        newPrice={14.99}
        discount={25}
        quantity={1}
      />
    </div>
  );
}

export default Home;
