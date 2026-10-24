import { useState, useCallback } from 'react';

const criteria: [string, string][] = [
  ['Necesidad real', 'Problema y efecto operativo documentados'],
  ['Responsable identificado', 'Interlocutor con capacidad de impulsar la decisión'],
  ['Datos disponibles', 'Muestra representativa y autorización'],
  ['Viabilidad técnica', 'Resultados de prueba y restricciones'],
  ['Presupuesto', 'Rango o procedimiento de aprobación'],
  ['Encaje con IREN', 'Servicios y condiciones confirmados por IREN'],
  ['Próximo paso', 'Acción aceptada por la empresa'],
];

const budgetItems: [string, string][] = [
  ['Dirección', '8.250 €'],
  ['Descubrimiento', '5.400 €'],
  ['Arquitectura y seguridad', '7.800 €'],
  ['Ingeniería', '15.000 €'],
  ['QA', '4.500 €'],
  ['Infraestructura', '3.000 €'],
  ['Viajes', '1.500 €'],
  ['Contingencia', '4.050 €'],
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function App() {
  const [checked, setChecked] = useState<boolean[]>(Array(7).fill(false));
  const [price, setPrice] = useState(62000);
  const [cost, setCost] = useState(49500);

  const checkedCount = checked.filter(Boolean).length;

  const handleReset = useCallback(() => {
    setChecked(Array(7).fill(false));
  }, []);

  const handleSample = useCallback(() => {
    setChecked([true, true, true, true, true, false, true]);
  }, []);

  const handleRestore = useCallback(() => {
    setPrice(62000);
    setCost(49500);
  }, []);

  const handleExport = useCallback(() => {
    const rows = criteria.map((c, i) => [
      c[0],
      checked[i] ? 'MARCADO EN DEMO' : 'NO MARCADO',
    ]);
    const content =
      'SIMULACION - NO ES EVIDENCIA REAL\n' +
      rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ficha_demostracion_iren.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }, [checked]);

  const margin = price - cost;
  const marginPct = ((price - cost) / price) * 100;

  const statusText =
    checkedCount === 7
      ? '7 criterios marcados · DEMO'
      : checkedCount > 0
        ? 'En validación · DEMO'
        : 'No cualificada';

  const statusColor =
    checkedCount === 7 ? 'text-accent' : 'text-[#ffcc8b]';

  return (
    <div className="min-h-screen">
      <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="font-extrabold tracking-wider text-lg">
            MONTEMOLIN<span className="text-accent">—AIHUB</span>
          </div>
          <nav className="flex gap-4 flex-wrap text-sm print-hide">
            <a href="#propuesta" className="text-muted hover:text-accent transition-colors">
              Propuesta
            </a>
            <a href="#metodo" className="text-muted hover:text-accent transition-colors">
              90 días
            </a>
            <a href="#calificacion" className="text-muted hover:text-accent transition-colors">
              Cualificación
            </a>
            <a href="#economia" className="text-muted hover:text-accent transition-colors">
              Viabilidad
            </a>
            <a href="#decision" className="text-muted hover:text-accent transition-colors">
              Decisión
            </a>
          </nav>
          <span className="border border-border rounded-full px-3 py-1.5 text-muted text-xs print-hide">
            Prototipo exploratorio · 25/10/2026
          </span>
        </header>

        {/* Hero */}
        <div className="pt-12 md:pt-18 pb-12">
          <div className="text-accent text-xs uppercase tracking-[0.14em] font-bold">
            IREN Europe · Badajoz · Propuesta no solicitada
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight max-w-4xl mt-4 font-bold">
            De la capacidad de computación al{' '}
            <span className="text-accent">valor empresarial verificable.</span>
          </h1>
          <p className="text-xl max-w-3xl text-muted mt-4">
            Un piloto de 90 días para investigar necesidades reales de IA, validar
            hasta dos casos de uso y documentar su posible encaje con los servicios
            de IREN.
          </p>
          <div className="flex gap-3 flex-wrap mt-7 print-hide">
            <a
              href="#calificacion"
              className="bg-accent text-dark-text px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-all no-underline"
            >
              Explorar la demostración
            </a>
            <a
              href="#decision"
              className="bg-transparent text-ink border border-border px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-all no-underline"
            >
              Ver decisión comercial
            </a>
          </div>
          <p className="text-xs text-muted mt-5">
            Sin relación contractual ni colaboración confirmada con IREN. El campus
            de Badajoz está planificado, no se presenta como operativo.
          </p>
        </div>

        {/* Propuesta */}
        <section id="propuesta" className="my-9">
          <div className="flex justify-between items-center gap-3 flex-wrap mb-5">
            <h2 className="text-2xl md:text-4xl tracking-tight font-bold">
              Una aportación concreta. Sin duplicar capacidades.
            </h2>
            <span className="text-accent text-xs font-bold">
              Hipótesis por validar con IREN
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <Eyebrow>01 · Demanda</Eyebrow>
              <h3 className="text-base font-bold mt-2 mb-2">Necesidad empresarial</h3>
              <p className="text-muted text-sm">
                Identificar problemas operativos, responsables de decisión y criterios
                de compra reales.
              </p>
            </Card>
            <Card>
              <Eyebrow>02 · Evidencia</Eyebrow>
              <h3 className="text-base font-bold mt-2 mb-2">Prueba técnica</h3>
              <p className="text-muted text-sm">
                Medir precisión, costes, seguridad y restricciones de aplicaciones
                documentales o de visión.
              </p>
            </Card>
            <Card>
              <Eyebrow>03 · Encaje</Eyebrow>
              <h3 className="text-base font-bold mt-2 mb-2">Oportunidad evaluable</h3>
              <p className="text-muted text-sm">
                Traducir resultados a requisitos cloud y someterlos a los criterios
                comerciales de IREN.
              </p>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight print-metric">
                300 MW
              </div>
              <div className="text-xs text-muted mt-1">
                Capacidad planificada del campus Badajoz, según IREN; no operativa
              </div>
            </Card>
            <Card>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight print-metric">
                2028+
              </div>
              <div className="text-xs text-muted mt-1">
                Horizonte mostrado por IREN para Badajoz; sujeto a evolución
              </div>
            </Card>
            <Card>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight print-metric">
                0
              </div>
              <div className="text-xs text-muted mt-1">
                Oportunidades cualificadas acreditadas hoy por este piloto
              </div>
            </Card>
          </div>
        </section>

        {/* Metodo */}
        <section id="metodo" className="my-9">
          <h2 className="text-2xl md:text-4xl tracking-tight font-bold mb-4">
            90 días. Cinco decisiones medibles.
          </h2>
          <div className="card-print bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
            <Step num="01–15" title="Alineación y permisos">
              Confirmar interés de IREN, cliente objetivo, equipo, alcance y permisos.{' '}
              <b>Puerta de decisión: continuar o detener.</b>
            </Step>
            <Step num="16–30" title="Descubrimiento y línea base">
              Explorar hasta 4–6 empresas candidatas, solo con autorización;
              seleccionar casos viables.
            </Step>
            <Step num="31–60" title="Prototipos limitados">
              Hasta dos pruebas en infraestructura independiente, con datos permitidos
              y resultados reproducibles.
            </Step>
            <Step num="61–75" title="Evaluación técnica y comercial">
              Documentar seguridad, coste, requisitos de cómputo, restricciones y
              encaje por confirmar.
            </Step>
            <Step num="76–90" title="Decisión de continuidad" last>
              Entregar dossier y recomendación: continuar, reformular o cerrar, sin
              prometer ventas.
            </Step>
          </div>
        </section>

        {/* Calificacion */}
        <section id="calificacion" className="my-9">
          <div className="flex justify-between items-center gap-3 flex-wrap mb-5">
            <h2 className="text-2xl md:text-4xl tracking-tight font-bold">
              ¿Qué es una oportunidad cualificada?
            </h2>
            <span className="border border-border rounded-full px-3 py-1.5 text-muted text-xs">
              Demostración con datos ficticios
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Checklist */}
            <div className="card-print bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
              <p className="text-muted text-sm mb-4">
                Marca cada criterio solo si existe evidencia documental. Este ejemplo
                no representa ninguna empresa real.
              </p>
              <div className="space-y-2">
                {criteria.map((c, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 p-3 border border-border rounded-xl bg-check-bg cursor-pointer hover:border-accent/40 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked[i]}
                      onChange={(e) => {
                        const next = [...checked];
                        next[i] = e.target.checked;
                        setChecked(next);
                      }}
                    />
                    <div>
                      <strong className="block text-sm">{c[0]}</strong>
                      <span className="text-muted text-xs">{c[1]}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap mt-4 print-hide">
                <button
                  onClick={handleReset}
                  className="bg-transparent text-ink border border-border px-4 py-2.5 rounded-xl font-bold cursor-pointer hover:brightness-110 transition-all"
                >
                  Reiniciar
                </button>
                <button
                  onClick={handleSample}
                  className="bg-transparent text-ink border border-border px-4 py-2.5 rounded-xl font-bold cursor-pointer hover:brightness-110 transition-all"
                >
                  Mostrar ejemplo simulado
                </button>
              </div>
            </div>

            {/* Qualification card */}
            <div className="card-print bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
              <div className="text-xs text-accent uppercase tracking-[0.14em] font-bold">
                Ficha de cualificación
              </div>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 print-metric">
                {checkedCount} / 7
              </div>
              <div className="h-2.5 bg-[#294052] rounded-full overflow-hidden my-4">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-200"
                  style={{ width: `${(checkedCount / 7) * 100}%` }}
                />
              </div>
              <div
                className={`inline-block px-3 py-2 rounded-lg bg-status-bg text-sm font-bold ${statusColor}`}
              >
                {statusText}
              </div>
              <h3 className="text-base font-bold mt-8 mb-2">
                Condiciones que no pueden omitirse
              </h3>
              <p className="text-muted text-sm">
                Una demo no equivale a un cliente. El criterio de encaje solo puede
                confirmarse cuando IREN valide su catálogo, segmento y condiciones
                comerciales.
              </p>
              <div className="border-l-3 border-warn pl-4 py-3 bg-notice-bg rounded-r-xl mt-4">
                <p className="text-sm text-muted">
                  Marcar casillas sirve para explicar el método; no certifica
                  evidencia real ni aceptación de IREN.
                </p>
              </div>
              <div className="mt-5 print-hide">
                <button
                  onClick={handleExport}
                  className="bg-transparent text-ink border border-border px-4 py-2.5 rounded-xl font-bold cursor-pointer hover:brightness-110 transition-all"
                >
                  Exportar ficha de demostración
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Economia */}
        <section id="economia" className="my-9">
          <h2 className="text-2xl md:text-4xl tracking-tight font-bold mb-4">
            Presupuesto transparente. No cerrado.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget table */}
            <div className="card-print bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
              <div className="text-xs text-accent uppercase tracking-[0.14em] font-bold mb-4">
                Escenario de referencia
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {budgetItems.map(([label, value], i) => (
                    <tr key={i}>
                      <td className="text-left py-2.5 border-b border-border text-sm">
                        {label}
                      </td>
                      <td className="text-left py-2.5 border-b border-border text-sm font-medium">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted mt-4">
                Importes indicativos, sin IVA. Equipo y tarifas aún no contratados.
              </p>
            </div>

            {/* Simulator */}
            <div className="card-print bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
              <div className="text-xs text-accent uppercase tracking-[0.14em] font-bold mb-4">
                Simulador interactivo
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm">
                    Precio comercial{' '}
                    <span className="float-right text-ink font-bold">
                      {formatCurrency(price)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={35000}
                    max={85000}
                    step={500}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm">
                    Coste directo{' '}
                    <span className="float-right text-ink font-bold">
                      {formatCurrency(cost)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={35000}
                    max={75000}
                    step={500}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="text-xs text-muted mt-5">Margen bruto hipotético</div>
              <div
                className={`text-3xl font-extrabold mt-1 print-metric ${
                  margin < 0 ? 'text-[#ffad8b]' : 'text-accent'
                }`}
              >
                {formatCurrency(margin)}
              </div>
              <p className="text-sm text-muted mt-1">
                {marginPct.toFixed(1).replace('.', ',')} % sobre ventas, antes de
                gastos generales e impuestos
              </p>
              <div className="border-l-3 border-warn pl-4 py-3 bg-notice-bg rounded-r-xl mt-4">
                <p className="text-sm text-muted">
                  El margen bruto no es beneficio neto. El precio solo se negociará
                  tras validar el alcance y el interés de IREN.
                </p>
              </div>
              <div className="mt-5 print-hide">
                <button
                  onClick={handleRestore}
                  className="bg-transparent text-ink border border-border px-4 py-2.5 rounded-xl font-bold cursor-pointer hover:brightness-110 transition-all"
                >
                  Restablecer
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Decision */}
        <section id="decision" className="my-9">
          <h2 className="text-2xl md:text-4xl tracking-tight font-bold mb-4">
            Una pregunta antes de comprometer recursos.
          </h2>
          <div className="card-print bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
            <p className="text-xl max-w-3xl text-ink mb-6">
              ¿Estaría IREN Europe interesada en evaluar casos de uso empresariales de
              IA, cualificados de forma independiente en Extremadura, como complemento
              a su estrategia europea de AI Cloud?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-base font-bold mb-2">Si hay interés</h3>
                <p className="text-muted text-sm">
                  Confirmar perfil de cliente, criterios de aceptación, interlocutor,
                  presupuesto y vía de contratación.
                </p>
              </div>
              <div>
                <h3 className="text-base font-bold mb-2">Si el encaje es parcial</h3>
                <p className="text-muted text-sm">
                  Reducir alcance o reformular la propuesta antes de gastar.
                </p>
              </div>
              <div>
                <h3 className="text-base font-bold mb-2">Si no hay encaje</h3>
                <p className="text-muted text-sm">
                  Detener el proyecto sin comprometer el presupuesto de ejecución.
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap mt-7 print-hide">
              <a
                href="mailto:info@iren.com?subject=IREN%20Europe%20-%20Exploratory%20AI%20demand%20pilot"
                className="bg-accent text-dark-text px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-all no-underline"
              >
                Solicitar conversación
              </a>
              <button
                onClick={() => window.print()}
                className="bg-transparent text-ink border border-border px-4 py-3 rounded-xl font-bold cursor-pointer hover:brightness-110 transition-all"
              >
                Imprimir presentación
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 pb-12 text-xs text-muted print-hide">
          MONTEMOLIN-AIHUB · Propuesta independiente, no respaldada ni contratada por
          IREN. Fuente principal:{' '}
          <a
            href="https://www.iren.com/data-centers/badajoz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent"
          >
            IREN Badajoz
          </a>
          . El proyecto y el precio son hipótesis exploratorias. No se almacenan ni
          transmiten datos introducidos en esta página.
        </footer>
      </div>
    </div>
  );
}

/* Sub-components */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-print bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-6">
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-accent uppercase tracking-[0.14em] font-bold">
      {children}
    </div>
  );
}

function Step({
  num,
  title,
  children,
  last,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex gap-4 py-4 ${last ? '' : 'border-b border-border'}`}
    >
      <div className="font-extrabold text-accent min-w-[72px] text-sm">
        {num}
      </div>
      <div>
        <h3 className="text-base font-bold mb-1">{title}</h3>
        <p className="text-muted text-sm m-0">{children}</p>
      </div>
    </div>
  );
}
