import { Check, X, Minus } from 'lucide-react';

type CellValue = boolean | 'partial' | string;

interface ComparisonRow {
  feature: string;
  ava: CellValue;
  viagogo: CellValue;
  stubhub: CellValue;
  facebook: CellValue;
}

const rows: ComparisonRow[] = [
  {
    feature: 'Prix ≤ Prix facial (loi)',
    ava: true,
    viagogo: false,
    stubhub: false,
    facebook: false,
  },
  {
    feature: 'Séquestre bancaire',
    ava: true,
    viagogo: false,
    stubhub: false,
    facebook: false,
  },
  {
    feature: 'KYC vendeurs obligatoire',
    ava: true,
    viagogo: false,
    stubhub: 'partial',
    facebook: false,
  },
  {
    feature: 'Vérification manuelle billets',
    ava: true,
    viagogo: false,
    stubhub: false,
    facebook: false,
  },
  {
    feature: 'Garantie remboursement + dédommagement',
    ava: true,
    viagogo: 'partial',
    stubhub: 'partial',
    facebook: false,
  },
  {
    feature: 'Frais acheteur',
    ava: '5%',
    viagogo: '25–40%',
    stubhub: '10–30%',
    facebook: '0% (mais zéro garantie)',
  },
  {
    feature: 'Frais vendeur',
    ava: '0%',
    viagogo: '15–25%',
    stubhub: '15%',
    facebook: '0%',
  },
  {
    feature: 'Support client réactif',
    ava: true,
    viagogo: false,
    stubhub: 'partial',
    facebook: false,
  },
  {
    feature: 'Conforme loi française',
    ava: true,
    viagogo: false,
    stubhub: false,
    facebook: false,
  },
];

function Cell({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" strokeWidth={2.5} />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
          <X className="h-4 w-4 text-red-500 dark:text-red-400" strokeWidth={2.5} />
        </div>
      </div>
    );
  }
  if (value === 'partial') {
    return (
      <div className="flex justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950/40">
          <Minus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" strokeWidth={2.5} />
        </div>
      </div>
    );
  }
  return (
    <div className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {value}
    </div>
  );
}

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-5 px-6 text-left text-sm font-semibold text-zinc-500 dark:text-zinc-400 w-[35%]">
              Fonctionnalité
            </th>
            <th className="py-5 px-4 text-center bg-primary/5 dark:bg-primary/10">
              <div className="flex flex-col items-center gap-1">
                <span className="text-base font-bold text-primary">AVA</span>
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                  Recommandé
                </span>
              </div>
            </th>
            <th className="py-5 px-4 text-center">
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Viagogo</span>
            </th>
            <th className="py-5 px-4 text-center">
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">StubHub</span>
            </th>
            <th className="py-5 px-4 text-center">
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Facebook</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className={`border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 ${
                index % 2 === 0 ? 'bg-white dark:bg-zinc-950' : 'bg-zinc-50/50 dark:bg-zinc-900/30'
              }`}
            >
              <td className="py-4 px-6 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {row.feature}
              </td>
              <td className="py-4 px-4 bg-primary/5 dark:bg-primary/5">
                <Cell value={row.ava} />
              </td>
              <td className="py-4 px-4">
                <Cell value={row.viagogo} />
              </td>
              <td className="py-4 px-4">
                <Cell value={row.stubhub} />
              </td>
              <td className="py-4 px-4">
                <Cell value={row.facebook} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-6 px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-green-600" />
          <span>Oui</span>
        </div>
        <div className="flex items-center gap-1.5">
          <X className="h-3.5 w-3.5 text-red-500" />
          <span>Non</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Minus className="h-3.5 w-3.5 text-yellow-600" />
          <span>Partiel / selon conditions</span>
        </div>
      </div>
    </div>
  );
}
