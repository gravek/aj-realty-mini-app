const Calculator = () => {
  const [price, setPrice] = useState(100000)
  return (
    <div>
      <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
      <p>Доходность: {price * 0.1} - {price * 0.12} $/год</p>
    </div>
  )
}

export default Calculator