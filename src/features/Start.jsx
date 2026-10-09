import { useApp } from "../appContext.jsx";
import { heutigerTag, lernspur, muenzenNachRunde, aufgabenZaehlen } from "../calc/lerntage.js";
import { missionsOpts } from "../calc/tagesform.js";
import { zeitUebrigMin } from "../calc/elternWerkzeuge.js";
import { EINSTUFUNG_FELDER } from "../calc/einstufung.js";
import { STARK_SAETZE } from "../calc/aufgaben/stark.js";
import { schulfreiAm } from "../calc/kalender.js";
import { kompassTermine, tageBis } from "../calc/kompassPlan.js";
import {
  wochenMontag, tagDatum, planFuerWoche, planSchreiben, bausteinInfo, bausteinAnzeige, blockFertig, blockUnfertig,
  tagGeschafft, heuteBelohnt, belohnungEintragen, WOCHENTAGE, slotLabel, schulFaecher, istAusgefallen, blockDauerVon, uhr, auffrischungen,
} from "../calc/wochenplan.js";

/* Startseite: Begrüßung, Tages-Stand (Münzen, Missionen, Lernspur),
   Einstieg ins Üben, Konzentrations-Training, Mut-Satz des Tages,
   Hell/Dunkel. Der Elternbereich hat (nach Passwort-Entsperrung)
   seinen eigenen Tab. */
export default function Start() {
  const { data, logChange, T, tresor, navTo, heute, uebenZielSetzen } = useApp();
  const einstufung = data.lernstand.einstufung;
  const feldName = (key) => EINSTUFUNG_FELDER.find((f) => f.key === key) || { emoji: "✏️", name: key };
  const dunkel = data.einstellungen.thema === "dunkel";
  const tag = heutigerTag(data.lernstand.lerntage, heute);
  const spur = lernspur(data.lernstand.lerntage, heute);
  const mut = data.lernstand.mutSatz;
  const mutHeute = mut.tag === heute;

  // 🗓️ Heute auf dem Wochenplan: Abhaken zählt zur Mini-Mission,
  // der komplett geschaffte Tag bringt 1 Münze (nur einmal je Datum).
  const montag = wochenMontag(heute);
  const plan = planFuerWoche(data.lernstand.wochenplan, montag);
  const heuteIdx = WOCHENTAGE.findIndex((_, i) => tagDatum(montag, i) === heute);
  const heutePlan = [...plan.bloecke.filter((b) => b.tag === heuteIdx)]
    .sort((a, b) => (a.slot ?? 9) - (b.slot ?? 9));
  const heuteFeste = [...(data.einstellungen.festeTermine || [])
    .filter((f) => f.tag === heuteIdx && !istAusgefallen(plan, heuteIdx, f.beginn))]
    .sort((a, b) => a.beginn - b.beginn);
  const planHaken = (id) => {
    const block = plan.bloecke.find((b) => b.id === id);
    if (!block || block.fertig) return;
    let neuPlan = blockFertig(plan, id);
    const lernstand = { ...data.lernstand };
    // Mission zählt nur beim ERSTEN Abhaken (nach „rückgängig" nicht nochmal).
    if (bausteinInfo(block.typ).lern && !block.gezaehlt) {
      lernstand.lerntage = aufgabenZaehlen(lernstand.lerntage, heute, 1, missionsOpts(data.einstellungen, data.lernstand.tagesform, heute));
    }
    if (tagGeschafft(neuPlan, heuteIdx) && !heuteBelohnt(neuPlan, heute)) {
      neuPlan = belohnungEintragen(neuPlan, heute);
      if (data.einstellungen.muenzenAktiv) lernstand.muenzen = muenzenNachRunde(lernstand.muenzen);
    }
    lernstand.wochenplan = planSchreiben(data.lernstand.wochenplan, neuPlan);
    logChange({ ...data, lernstand }, "wochenplan", "neu", `Plan-Baustein „${block.typ}“ abgehakt`);
  };
  const planZiel = { mathe: "ueben", deutsch: "ueben", lernen: "ueben", schrift: "schrift", konz: "konz" };

  const mutWaehlen = (idx) => {
    logChange(
      { ...data, lernstand: { ...data.lernstand, mutSatz: { tag: heute, idx } } },
      "stark", "neu", "Mut-Satz des Tages gewählt",
    );
  };

  const themaWechseln = () => {
    const neu = {
      ...data,
      einstellungen: { ...data.einstellungen, thema: dunkel ? "hell" : "dunkel" },
    };
    logChange(neu, "einstellungen", "geaendert", `Darstellung auf ${dunkel ? "Hell" : "Dunkel"} gestellt`);
  };

  return (
    <div data-test="start-seite">
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <h2 style={{ margin: "0 0 6px" }}>Hallo! 👋</h2>
        <p data-test="tages-stand" style={{ margin: "0 0 10px", color: T.textLeise }}>
          🪙 {data.lernstand.muenzen} Münze{data.lernstand.muenzen === 1 ? "" : "n"} ·
          heute {tag.missionen} Mini-Mission{tag.missionen === 1 ? "" : "en"}
          {tag.zielErreicht ? " · 🎯 Tagesziel geschafft!" : ""}
          {spur > 1 ? ` · 🛤️ ${spur} Tage Lernspur` : ""}
          {data.einstellungen.zeitLimit > 0 ? ` · ⏰ noch ${zeitUebrigMin(data.lernstand.zeit, data.einstellungen.zeitLimit, heute)} Min` : ""}
        </p>
        <button data-test="zum-ueben" onClick={() => navTo("ueben")}
          style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
          ✏️ Jetzt üben (Deutsch · Mathe · Sachkunde · Stark)
        </button>
        <button data-test="zum-konz" onClick={() => navTo("konz")}
          style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
          🧠 Konzentrations-Training (Zahlen · ABC · Blitzlesen)
        </button>
        <button data-test="zum-schrift" onClick={() => navTo("schrift")}
          style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
          🖐️ Schreib-Training (1 Satz am Tag, mit der Hand)
        </button>
        <button data-test="zum-aufsatz" onClick={() => navTo("aufsatz")}
          style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
          ✍️ Aufsatz-Check (Leo liest dein Foto)
        </button>
        <button data-test="zum-plan" onClick={() => navTo("plan")}
          style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
          🗓️ Mein Wochenplan (DU bestimmst dein Pensum)
        </button>
      </div>
      {(heutePlan.length > 0 || heuteFeste.length > 0) && (
        <div data-test="heute-plan" style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
          <b>🗓️ Heute auf deinem Plan</b>
          {schulfreiAm(heute) && (
            <p data-test="heute-ferien" style={{ margin: "6px 0 0", fontWeight: 700 }}>
              {schulfreiAm(heute).emoji} {schulfreiAm(heute).name} – der ganze Tag gehört dir!
            </p>
          )}
          {auffrischungen(data.einstellungen.termine, montag, heuteIdx).map((a) => (
            <p key={`auf-${a.id}`} data-test="heute-auffrischung" style={{
              margin: "6px 0 0", fontWeight: 700, borderRadius: T.radiusKlein, padding: "6px 10px",
              background: "color-mix(in srgb, var(--akzent) 30%, var(--karte))",
            }}>
              🌅 Heute: {a.emoji} {a.text} – du hast verteilt geübt, du kannst das! 💪
            </p>
          ))}
          {schulFaecher(heuteIdx).length > 0 && (
            <p data-test="heute-schule" style={{ margin: "6px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              🏫 Heute in der Schule: {schulFaecher(heuteIdx).join(" · ")}
            </p>
          )}
          <div style={{ display: "grid", gap: 6, margin: "8px 0 0" }}>
            {heuteFeste.map((f) => (
              <div key={`f-${f.beginn}`} data-test="heute-fest" style={{
                display: "flex", alignItems: "center", gap: 8,
                background: T.grund, borderRadius: T.radiusKlein, padding: "6px 10px",
                border: `1.5px solid ${T.rand}`,
              }}>
                <span style={{ flex: 1, fontWeight: 700 }}>
                  {f.emoji} {f.name} <span style={{ color: T.textLeise, fontWeight: 400 }}>· {slotLabel(f.beginn)}{f.hinweis ? ` (${f.hinweis})` : ""}</span>
                </span>
                <span style={{ opacity: 0.6 }}>🔒</span>
              </div>
            ))}
            {heutePlan.map((b) => {
              const info = bausteinAnzeige(b.typ, data.einstellungen);
              const ziel = planZiel[b.typ];
              return (
                <div key={b.id} data-test="heute-block" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: T.grund, borderRadius: T.radiusKlein, padding: "6px 10px",
                  opacity: b.fertig ? 0.65 : 1,
                }}>
                  <span style={{ flex: 1, fontWeight: 700, textDecoration: b.fertig ? "line-through" : "none" }}>
                    {info.emoji} {b.typ === "eigen" ? (b.notiz || info.name) : `${info.name}${b.notiz ? ` · ${b.notiz}` : ""}`}
                    <span style={{ color: T.textLeise, fontWeight: 400 }}>
                      {Number.isInteger(b.slot) ? ` · ${slotLabel(b.slot)}${blockDauerVon(b) > 30 ? `–${uhr(b.slot + blockDauerVon(b))}` : ""}` : ""}{info.lern && info.box !== false ? " · 10+5 Min" : info.kurz ? " · 10 Min" : ""}
                    </span>
                  </span>
                  {b.fertig ? (
                    <button data-test="heute-unhaken" title="Doch nicht fertig? Haken entfernen"
                      onClick={() => logChange({ ...data, lernstand: { ...data.lernstand, wochenplan: planSchreiben(data.lernstand.wochenplan, blockUnfertig(plan, b.id)) } }, "wochenplan", "geaendert", "Haken entfernt")}
                      style={{ background: "transparent", color: T.ok, fontWeight: 800, height: "auto", minHeight: 0, padding: "0 6px" }}>
                      ✓ <span style={{ fontSize: "12px", fontWeight: 400, color: T.textLeise }}>↩︎</span>
                    </button>
                  ) : (
                    <>
                      {ziel && (
                        <button data-test="heute-los" onClick={() => navTo(ziel)}
                          style={{ background: T.primaer, color: T.primaerText, fontWeight: 700, height: "auto", minHeight: 0, padding: "6px 10px" }}>
                          ▶ Los
                        </button>
                      )}
                      <button data-test="heute-haken" onClick={() => planHaken(b.id)}
                        style={{ background: T.weich, color: T.text, fontWeight: 700, height: "auto", minHeight: 0, padding: "6px 10px" }}>
                        ✓ Gemacht
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {tagGeschafft(plan, heuteIdx) && (
            <p data-test="heute-geschafft" style={{ margin: "10px 0 0", color: T.ok, fontWeight: 800 }}>
              🎉 Tagesplan komplett geschafft{heuteBelohnt(plan, heute) && data.einstellungen.muenzenAktiv ? " – 🪙 +1 Münze!" : "!"} Stark, dass DU das geplant und durchgezogen hast!
            </p>
          )}
        </div>
      )}
      {(() => {
        // 🧭 Kompass-Countdown-Karte: erscheint, sobald ein Test in Sicht ist (≤ 10 Wochen)
        const ziele = kompassTermine(data.einstellungen.termine, heute);
        if (!ziele.length || tageBis(heute, ziele[0].tag) > 70) return null;
        return (
          <button data-test="kompass-karte" onClick={() => navTo("kompass")} style={{
            width: "100%", textAlign: "left", display: "block", height: "auto",
            background: T.karte, color: T.text, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand,
            border: `1px solid ${T.rand}`,
          }}>
            <b>🧭 Kompass-Countdown</b>
            <span style={{ float: "right", color: T.primaer, fontWeight: 800 }}>noch {tageBis(heute, ziele[0].tag)} Tage</span>
            <span style={{ display: "block", marginTop: 4, color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              Dein Lernplan bis zu den Tests – Woche für Woche, ein Tipp startet die Übung.
            </span>
          </button>
        );
      })()}
      {!einstufung ? (
        <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
          <b>🧪 Einstufungstest</b>
          <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Finde deinen Start: ein paar Aufgaben aus Deutsch und Mathe – danach stellt
            die App die Stufen genau auf dich ein und baut deinen Trainingsplan.
          </p>
          <button data-test="einstufung-start" onClick={() => navTo("einstufung")}
            style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}>
            🧪 Einstufungstest machen
          </button>
        </div>
      ) : (
        <div data-test="trainingsplan" style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
          <b>🎯 Dein Trainingsplan</b>
          <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Aus deinem Einstufungstest vom {einstufung.tag} – übe am besten zuerst hier:
          </p>
          {einstufung.empfehlung.length ? einstufung.empfehlung.map((key) => (
            <button key={key} data-test="plan-feld" data-key={key}
              onClick={() => { uebenZielSetzen(key); navTo("ueben"); }}
              style={{ width: "100%", marginBottom: 8, background: T.weich, color: T.text, fontWeight: 700, textAlign: "left", padding: "0 14px" }}>
              {feldName(key).emoji} {feldName(key).name} üben
            </button>
          )) : (
            <p style={{ margin: 0 }}>🌟 Alles auf Profi-Stufe – stark! Übe frei, worauf du Lust hast.</p>
          )}
          <button data-test="einstufung-nochmal" onClick={() => navTo("einstufung")}
            style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            🧪 Einstufungstest wiederholen
          </button>
        </div>
      )}
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <b>🦁 Mut-Satz des Tages</b>
        {mutHeute ? (
          <>
            <p data-test="mut-satz-heute" style={{ margin: "8px 0 4px", fontWeight: 800, fontSize: "var(--schrift-gross)" }}>
              „{STARK_SAETZE[mut.idx]}“
            </p>
            <p style={{ margin: 0, color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              🦁 Starker Satz! Er gehört heute dir. Morgen darfst du einen neuen wählen.
            </p>
          </>
        ) : (
          <>
            <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              Such dir einen Satz aus, der dich heute stark macht – sprich ihn einmal laut!
            </p>
            <div style={{ display: "grid", gap: 6 }}>
              {STARK_SAETZE.map((satz, i) => (
                <button key={i} data-test="mut-satz-wahl" onClick={() => mutWaehlen(i)}
                  style={{ textAlign: "left", background: T.weich, color: T.text }}>
                  {satz}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
        <b>Darstellung</b>
        <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Hell oder Dunkel – wie du magst.
        </p>
        <button
          data-test="thema-schalter"
          onClick={themaWechseln}
          style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}
        >
          {dunkel ? "☀️ Hell einschalten" : "🌙 Dunkel einschalten"}
        </button>
      </div>
      {tresor.elternModus && (
        <button data-test="zum-eltern" onClick={() => navTo("eltern")}
          style={{ width: "100%", marginTop: T.abstand, background: T.weich, color: T.text, fontWeight: 700 }}>
          🔧 Zum Elternbereich
        </button>
      )}
    </div>
  );
}
