import { NextRequest, NextResponse } from 'next/server';

async function getCdekToken(): Promise<string> {
  const res = await fetch('https://api.cdek.ru/v2/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.CDEK_CLIENT_ID!,
      client_secret: process.env.CDEK_CLIENT_SECRET!,
    }),
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const { city, weight = 1000 } = await req.json();

  if (!city?.trim()) {
    return NextResponse.json({ error: 'Город не указан' }, { status: 400 });
  }

  try {
    const token = await getCdekToken();

    const cityRes = await fetch(
      `https://api.cdek.ru/v2/location/cities?city=${encodeURIComponent(city.trim())}&size=1`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const cityData = await cityRes.json();

    if (!Array.isArray(cityData) || cityData.length === 0) {
      return NextResponse.json({ error: 'Город не найден' }, { status: 404 });
    }

    const toCode = cityData[0].code;
    const fromCode = Number(process.env.CDEK_FROM_CITY_CODE || '44');

    const listRes = await fetch(
      'https://api.cdek.ru/v2/calculator/tarifflist',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 1,
          from_location: { code: fromCode },
          to_location: { code: toCode },
          packages: [{ weight, height: 10, length: 10, width: 10 }],
        }),
      },
    );
    const listData = await listRes.json();

    type TariffItem = {
      tariff_code: number;
      delivery_mode: number;
      delivery_sum: number;
      period_min: number;
      period_max: number;
    };

    const all: TariffItem[] = listData.tariff_codes ?? [];
    const pvz = all
      .filter((t) => t.delivery_mode === 4 && t.delivery_sum > 0)
      .sort((a, b) => a.delivery_sum - b.delivery_sum);

    const pick =
      pvz[0] ??
      all
        .filter((t) => t.delivery_sum > 0)
        .sort((a, b) => a.delivery_sum - b.delivery_sum)[0];

    if (!pick) {
      return NextResponse.json(
        { error: 'Нет доступных тарифов для этого маршрута' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      cost: Math.ceil(pick.delivery_sum),
      periodMin: pick.period_min,
      periodMax: pick.period_max,
    });
  } catch {
    return NextResponse.json(
      { error: 'Ошибка расчёта доставки' },
      { status: 500 },
    );
  }
}
