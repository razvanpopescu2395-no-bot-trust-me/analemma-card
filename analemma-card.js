class AnalemmaCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <ha-card header="Analema Solara">
          <div class="card-content" style="display:flex; justify-content:center; align-items:center; padding: 10px;">
            <canvas id="analemmaCanvas" width="350" height="300"></canvas>
          </div>
        </ha-card>
      `;
      this.content = true;
      this.drawAnalemma();
    }
  }

  // Calculate Equation of Time (in minutes)
  getEOT(dayOfYear) {
    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);
    return 229.18 * (
      0.000075 + 
      0.001868 * Math.cos(gamma) - 
      0.032077 * Math.sin(gamma) - 
      0.014615 * Math.cos(2 * gamma) - 
      0.040849 * Math.sin(2 * gamma)
    );
  }

  // Calculate Solar Declination (in degrees)
  getDeclination(dayOfYear) {
    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);
    const declRad = 0.006918 - 
      0.399912 * Math.cos(gamma) + 
      0.070257 * Math.sin(gamma) - 
      0.006758 * Math.cos(2 * gamma) + 
      0.00907 * Math.sin(2 * gamma);
    return declRad * (180 / Math.PI);
  }

  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  drawAnalemma() {
    const canvas = this.querySelector("#analemmaCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Map EOT (-20 to +20 mins) and Declination (-25 to +25 deg) onto Canvas coordinates
    const mapX = (eot) => w / 2 + eot * 6.5; 
    const mapY = (dec) => h / 2 - dec * 4.8;

    // 1. Grid & Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Equator Line (Declination = 0)
    ctx.moveTo(20, mapY(0)); ctx.lineTo(w - 20, mapY(0));
    // Prime Meridian (EOT = 0)
    ctx.moveTo(mapX(0), 20); ctx.lineTo(mapX(0), h - 20);
    ctx.stroke();

    // Axes Labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "10px sans-serif";
    ctx.fillText("Summer Solstice (+23.5°)", 20, mapY(23.5) - 5);
    ctx.fillText("Winter Solstice (-23.5°)", 20, mapY(-23.5) + 12);

    // 2. Full Analemma Curve (365 days)
    ctx.strokeStyle = "#4fc3f7";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let day = 1; day <= 365; day++) {
      const eot = this.getEOT(day);
      const dec = this.getDeclination(day);
      const x = mapX(eot);
      const y = mapY(dec);

      if (day === 1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // 3. Quarterly Markers (Jan 1, Apr 1, Jul 1, Oct 1)
    const monthDays = [1, 91, 182, 274];
    const monthLabels = ["Jan 1", "Apr 1", "Jul 1", "Oct 1"];
    ctx.fillStyle = "#ffb74d";

    monthDays.forEach((day, idx) => {
      const x = mapX(this.getEOT(day));
      const y = mapY(this.getDeclination(day));
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillText(monthLabels[idx], x + 6, y + 3);
    });

    // 4. Current Sun Position TODAY
    const today = new Date();
    const dayOfYear = this.getDayOfYear(today);
    const todayEOT = this.getEOT(dayOfYear);
    const todayDec = this.getDeclination(dayOfYear);

    const sunX = mapX(todayEOT);
    const sunY = mapY(todayDec);

    // Sun Glow Effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffeb3b";
    ctx.fillStyle = "#ffee58";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 7, 0, 2 * Math.PI);
    ctx.fill();

    // Reset Glow
    ctx.shadowBlur = 0;

    // Current Date Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`Today (${today.getDate()}/${today.getMonth() + 1})`, sunX + 10, sunY - 5);
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 4;
  }
}

customElements.define("analemma-card", AnalemmaCard);
